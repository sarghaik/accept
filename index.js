import axios from 'axios';
import fs from 'fs';
// import config from './configs/index.js';
import { calc } from './core.js';

const server_url = 'http://localhost:3000';

fs.readFile(process.argv[2], 'utf-8', async (err, data) => {
  if (err) throw err;
  const config = await axios.get(`${server_url}/config`);
  console.log(calc(JSON.parse(data), config.data));
});
