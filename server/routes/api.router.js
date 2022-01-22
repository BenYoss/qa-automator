const { Router } = require('express');
const fs = require('fs');

const app = Router();

let files = null;

app.post('/main', (req, res) => {
  files = req.file;
  fs.writeFile('main_file/main.pdf', req.file.buffer, (err) => {
    if (err) { console.log(err); } else {
      console.log('File written successfully\n');
    }
  });
  res.end();
});

app.post('/comp', (req, res) => {
  files = req.file;
  fs.writeFile('comp_files/comp.pdf', req.file.buffer, (err) => {
    if (err) { console.log(err); } else {
      console.log('File written successfully\n');
    }
  });
  res.end();
});

app.get('/main', (req, res) => {
  if (files) {
    res.send(files);
  }
  res.end();
});

module.exports = app;
