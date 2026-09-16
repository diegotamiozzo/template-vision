import os
import base64
import binascii
import hashlib
import hmac
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from google.cloud import storage

load_dotenv(Path(__file__).parent / ".env")
app = FastAPI()

auth_scheme = HTTPBearer(auto_error=False)
auth_secret = os.getenv("AUTH_SECRET")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Rota Raiz para evitar o 404 no Render ---
@app.get("/")
def read_root():
    return {"message": "API do Template Vision está online!", "status": "success"}

# Inicialização do Google Cloud Storage
storage_client = storage.Client.from_service_account_json(
    str(Path(__file__).parent / "credentials.json"),
    project=os.getenv("GOOGLE_CLOUD_PROJECT_ID"),
)
bucket = storage.bucket(os.getenv("GOOGLE_CLOUD_BUCKET_NAME"))


class LoginRequest(BaseModel):
    username: str
    password: str


def create_token(username: str) -> str:
    if not auth_secret:
        raise HTTPException(status_code=503, detail="Segredo de autenticação não configurado.")
    payload = json.dumps({"sub": username, "iat": int(time.time())}, separators=(",", ":")).encode()
    encoded_payload = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    signature = hmac.new(auth_secret.encode(), encoded_payload.encode(), hashlib.sha256).hexdigest()
    return f"{encoded_payload}.{signature}"


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme),
) -> str:
    if not auth_secret:
        raise HTTPException(status_code=503, detail="Segredo de autenticação não configurado.")
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Autenticação necessária.")

    try:
        encoded_payload, signature = credentials.credentials.split(".", 1)
        expected_signature = hmac.new(
            auth_secret.encode(),
            encoded_payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError
        payload = json.loads(base64.urlsafe_b64decode(f"{encoded_payload}==="))
        if int(time.time()) - payload["iat"] > 86400:
            raise ValueError
        return payload["sub"]
    except (ValueError, KeyError, TypeError, json.JSONDecodeError, binascii.Error):
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")


@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    expected_username = os.getenv("APP_USERNAME")
    expected_password = os.getenv("APP_PASSWORD")
    if not expected_username or not expected_password or not auth_secret:
        raise HTTPException(status_code=503, detail="Credenciais da aplicação não configuradas.")
    if not hmac.compare_digest(credentials.username, expected_username) or not hmac.compare_digest(
        credentials.password,
        expected_password,
    ):
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
    return {"token": create_token(expected_username), "username": expected_username}


def get_image_url(blob: storage.Blob) -> str:
    """URL assinada válida por 1 hora (mesmo comportamento do JS)."""
    return blob.generate_signed_url(
        version="v4",
        expiration=3600,
        method="GET",
    )


def validate_file_name(file_name: str) -> str:
    if not file_name or ".." in file_name:
        raise HTTPException(status_code=400, detail="Nome de arquivo inválido.")
    return file_name


# --- 1. CREATE (Upload de imagem) ---
@app.post("/api/images", status_code=201)
async def upload_image(image: UploadFile = File(...), _: str = Depends(require_auth)):
    file_name = f"{int(time.time() * 1000)}-{image.filename}"
    blob = bucket.blob(file_name)
    content = await image.read()
    blob.upload_from_string(
        content,
        content_type=image.content_type,
    )
    blob.cache_control = "public,max-age=3600"
    blob.patch()
    return {"message": "Upload realizado com sucesso!", "url": get_image_url(blob), "name": file_name}


# --- 2. READ (Listar imagens do bucket) ---
@app.get("/api/images")
async def list_images(_: str = Depends(require_auth)):
    return [
        {
            "name": blob.name,
            "url": get_image_url(blob),
            "updated": blob.updated.isoformat() if blob.updated else None,
        }
        for blob in bucket.list_blobs()
    ]


# --- 3. UPDATE (Atualizar/Substituir uma imagem existente) ---
@app.put("/api/images/{file_name:path}")
async def update_image(file_name: str, image: UploadFile = File(...), _: str = Depends(require_auth)):
    validate_file_name(file_name)
    blob = bucket.blob(file_name)
    content = await image.read()
    blob.upload_from_string(content, content_type=image.content_type)
    return {"message": "Imagem atualizada com sucesso!", "url": get_image_url(blob)}


# --- 4. DELETE (Deletar imagem) ---
@app.delete("/api/images/{file_name:path}")
async def delete_image(file_name: str, _: str = Depends(require_auth)):
    validate_file_name(file_name)
    blob = bucket.blob(file_name)
    if not blob.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada.")
    blob.delete()
    return {"message": "Imagem deletada com sucesso!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 3000)))