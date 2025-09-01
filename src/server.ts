import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/config';
import routes from './routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api', routes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API TODO List funcionando con TypeScript y MySQL!',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    }
  });
});

// Manejo de errores global
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor y probar conexión a BD
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  
  try {
    await testConnection();
    console.log('✅ Base de datos conectada correctamente');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
  }
});

export default app;