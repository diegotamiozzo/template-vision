const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Multer para guardar o arquivo temporariamente na memória RAM
const upload = multer({ storage: multer.memoryStorage() });

// Inicialização do Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'credentials.json'),
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

const getImageUrl = async (file) => {
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
    version: 'v4',
  });

  return url;
};

const saveImage = async (fileName, uploadedFile) => {
  const file = bucket.file(fileName);
  await file.save(uploadedFile.buffer, {
    contentType: uploadedFile.mimetype,
    resumable: false,
    metadata: {
      cacheControl: 'public,max-age=3600',
    },
  });

  return file;
};

const getFileNameFromRequest = (fileName) => {
  if (!fileName || fileName.includes('..')) {
    const error = new Error('Nome de arquivo inválido.');
    error.statusCode = 400;
    throw error;
  }

  return fileName;
};

// --- 1. CREATE (Upload de imagem) ---
app.post('/api/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const file = await saveImage(fileName, req.file);
    const url = await getImageUrl(file);
    res.status(201).json({ message: 'Upload realizado com sucesso!', url, name: fileName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 2. READ (Listar imagens do bucket) ---
app.get('/api/images', async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    const imageList = await Promise.all(files.map(async (file) => ({
      name: file.name,
      url: await getImageUrl(file),
      updated: file.metadata.updated,
    })));
    res.json(imageList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 3. UPDATE (Atualizar/Substituir uma imagem existente) ---
app.put('/api/images/:fileName', upload.single('image'), async (req, res) => {
  try {
    const fileName = getFileNameFromRequest(req.params.fileName);
    if (!req.file) return res.status(400).json({ error: 'Nenhum novo arquivo enviado.' });

    const file = await saveImage(fileName, req.file);
    const url = await getImageUrl(file);
    res.json({ message: 'Imagem atualizada com sucesso!', url });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// --- 4. DELETE (Deletar imagem) ---
app.delete('/api/images/:fileName', async (req, res) => {
  try {
    const fileName = getFileNameFromRequest(req.params.fileName);
    await bucket.file(fileName).delete();
    res.json({ message: 'Imagem deletada com sucesso!' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));