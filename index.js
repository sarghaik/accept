import fs from 'fs';
import config from './configs/index.js';
import { calc } from './core.js';

fs.readFile(process.argv[2], 'utf-8', (err, data) => {
  if (err) throw err;
  console.log(calc(JSON.parse(data), config));
});
