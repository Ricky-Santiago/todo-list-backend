import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '✅ API TODO List funcionando con TypeScript y MySQL!' });
});

// Iniciar servidor y probar conexión a BD
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  
  try {
    await testConnection();
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos');
  }
});