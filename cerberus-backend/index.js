// root index.js
import dotenv from 'dotenv';
dotenv.config(); 

import app from './src/app.js';
import { config } from './src/config/index.js';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});