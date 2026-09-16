# Template Vision

Template inicial para aplicações de visão computacional. O projeto é dividido em duas partes:

- **Front-end**: React + Vite, com autenticação e uma galeria de imagens.
- **Back-end**: FastAPI, responsável pela autenticação e pelo armazenamento das imagens no Google Cloud Storage.

No estado atual, o projeto cobre a parte de infraestrutura (login, upload, listagem, atualização e exclusão de imagens). A etapa de análise por visão computacional (detecção, classificação, OCR, etc.) ainda não foi implementada e deve ser adicionada sobre esta base.

## Estrutura do projeto

```
├── 📁 public
│   ├── 📄 favicon.ico
│   └── 🖼️ logo-vision.png
├── 📁 server
│   ├── ⚙️ .env.example
│   ├── 🐍 main.py
│   └── 📄 requirements.txt
├── 📁 src
│   ├── 📁 assets
│   ├── 📁 components
│   │   ├── 📁 common
│   │   │   ├── 📄 AppLayout.jsx
│   │   │   └── 📄 ProtectedRoute.jsx
│   │   └── 📁 gallery
│   │       ├── 📄 ImageCard.jsx
│   │       ├── 📄 ImageGallery.jsx
│   │       ├── 📄 ImagePreviewModal.jsx
│   │       └── 📄 ImageUploadForm.jsx
│   ├── 📁 context
│   │   ├── 📄 AuthContext.jsx
│   │   ├── 📄 auth-context.js
│   │   └── 📄 useAuth.js
│   ├── 📁 pages
│   │   ├── 📄 GalleryPage.jsx
│   │   ├── 📄 LoginPage.jsx
│   │   └── 📄 PlaceholderPage.jsx
│   ├── 📁 services
│   │   ├── 📄 api.js
│   │   ├── 📄 authService.js
│   │   └── 📄 imageService.js
│   ├── 📁 styles
│   │   ├── 🎨 auth.css
│   │   ├── 🎨 base.css
│   │   ├── 🎨 gallery.css
│   │   ├── 🎨 index.css
│   │   ├── 🎨 responsive.css
│   │   ├── 🎨 tokens.css
│   │   └── 🎨 workspace.css
│   ├── 📄 App.jsx
│   ├── 🎨 index.css
│   └── 📄 main.jsx
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ package-lock.json
├── ⚙️ package.json
└── 📄 vite.config.js
```

## Pré-requisitos

- Node.js 18 ou superior
- Python 3.10 ou superior
- Uma conta no Google Cloud com um bucket criado no Google Cloud Storage
- Um arquivo de credenciais de service account com permissão de leitura e escrita no bucket

## Configuração do back-end

1. Acesse a pasta do servidor:

```bash
cd server
```

2. Crie um ambiente virtual e instale as dependências:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. Copie o arquivo de exemplo de variáveis de ambiente e preencha com os seus dados:

```bash
cp .env.example .env
```

Variáveis necessárias:

- `PORT`: porta em que o servidor vai rodar (padrão 3000)
- `GOOGLE_CLOUD_PROJECT_ID`: id do projeto no Google Cloud
- `GOOGLE_CLOUD_BUCKET_NAME`: nome do bucket usado para armazenar as imagens
- `APP_USERNAME`: usuário de acesso à aplicação
- `APP_PASSWORD`: senha de acesso à aplicação
- `AUTH_SECRET`: chave usada para assinar o token de sessão

4. Coloque o arquivo de credenciais da service account na pasta `server` com o nome `credentials.json`. Esse arquivo não deve ser versionado (já está incluído no `.gitignore`).

5. Rode o servidor:

```bash
python main.py
```

O back-end ficará disponível em `http://localhost:3000` (ou na porta definida em `PORT`).

## Configuração do front-end

1. Na raiz do projeto, instale as dependências:

```bash
npm install
```

2. Se o back-end não estiver rodando em `http://localhost:3000`, defina a variável `VITE_API_URL` em um arquivo `.env` na raiz do projeto, apontando para o endereço correto.

3. Rode o servidor de desenvolvimento:

```bash
npm run dev
```

4. Acesse a aplicação pelo endereço exibido no terminal, normalmente `http://localhost:5173`.

## Scripts disponíveis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: gera a versão de produção
- `npm run preview`: serve a versão de produção localmente
- `npm run lint`: executa a verificação de lint

## Próximos passos

- Implementar o serviço de análise de imagens (modelo de visão computacional).
- Persistir os resultados das análises, além dos arquivos de imagem.
- Exibir os resultados da análise na galeria (marcações, classes, confiança).
- Adicionar testes automatizados para o front-end e para o back-end.