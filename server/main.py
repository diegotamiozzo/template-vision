import os
import time
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage
load_dotenv(Path(__file__).parent / ".env")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# Inicialização do Google Cloud Storage
storage_client = storage.Client.from_service_account_json(
    str(Path(__file__).parent / "credentials.json"),
    project=os.getenv("GOOGLE_CLOUD_PROJECT_ID"),
)
bucket = storage_client.bucket(os.getenv("GOOGLE_CLOUD_BUCKET_NAME"))
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
async def upload_image(image: UploadFile = File(...)):
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
async def list_images():
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
async def update_image(file_name: str, image: UploadFile = File(...)):
    validate_file_name(file_name)
    blob = bucket.blob(file_name)
    content = await image.read()
    blob.upload_from_string(content, content_type=image.content_type)
    return {"message": "Imagem atualizada com sucesso!", "url": get_image_url(blob)}
# --- 4. DELETE (Deletar imagem) ---
@app.delete("/api/images/{file_name:path}")
async def delete_image(file_name: str):
    validate_file_name(file_name)
    blob = bucket.blob(file_name)
    if not blob.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada.")
    blob.delete()
    return {"message": "Imagem deletada com sucesso!"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 3000)))
