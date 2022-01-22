const express = require('express');
const multer = require('multer');

const path = require('path');

const api = require('./routes/api.router');

const PORT = process.env.PORT || '8080';
const app = express();

const dist = path.resolve(__dirname, '../client/dist');

// multer helps with passing file data via RESTful requests.
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // important to make a file size limit to prevent catastrophe.
    fileSize: 5 * 1024 * 1024,
  },
});

app.disable('x-powered-by');
app.use(multerMid.single('fileUpload'));

app.use(express.json());
app.use(express.static(dist));
// hosting the main/comparison files as local URLs for pdfjs to recognize.
app.use('/main', express.static(path.resolve(__dirname, '../main_file/main.pdf')));
app.use('/comp', express.static(path.resolve(__dirname, '../comp_files/comp.pdf')));
app.use('/upload', api);

app.get('/', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 🌌`);
});
