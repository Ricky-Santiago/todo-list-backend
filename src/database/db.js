const mysql = require('mysql2');
require('dotenv').config();

// Crear conexión a la base de datos
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todolist'
});

// Conectar a la base de datos
connection.connect((error) => {
  if (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return;
  }
  console.log('✅ Conectado a MySQL correctamente');
});

module.exports = connection;