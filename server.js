const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./src/database/db');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes'); // ← Agregar esta línea

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); // ← Agregar esta línea

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: '¡Backend funcionando correctamente! 🚀' });
});

// Ruta para probar la base de datos
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error de base de datos' });
    }
    res.json({ message: '✅ Conexión a MySQL exitosa', result: results[0].solution });
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});