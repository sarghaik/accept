import express from 'express';
import config from './configs/index.js';

const app = express();
const port = 3000;

app.get('/config', (req, res) => {
  res.json(config);
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
