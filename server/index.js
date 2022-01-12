const express = require('express');
const path = require('path');

const PORT = process.env.PORT || '8080';
const app = express();

const dist = path.resolve(__dirname, '../client/dist');

app.use(express.static(dist));

app.get('/', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 🌌`);
});
