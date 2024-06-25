// Llamando las dependencias utilizadas
const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Creando conexión de la base de datos con MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tallerdb',
  port: 3306
});

// Conectar a MySQL
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err.message);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Middleware para parsear datos del formulario
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el formulario
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para mostrar los datos en index.ejs
app.get('/index', (req, res) => {
  const sql = 'SELECT * FROM entradas';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('index', { entradas: results });
  });
});

// Ruta para procesar el formulario
app.post('/submit', upload.single('imagen'), (req, res) => {
  const { titulo, comentario } = req.body;
  const imagen = req.file ? req.file.filename : null;

  const sql = 'INSERT INTO entradas (titulo, comentario, imagen) VALUES (?, ?, ?)';
  db.query(sql, [titulo, comentario, imagen], (err, result) => {
    if (err) {
      throw err;
    }
    console.log('Entrada insertada en la base de datos');
    res.render('confirmacion', { titulo, comentario, imagen });
  });
});

// Ruta para obtener datos de la tabla y enviarlos como JSON
app.get('/api/entradas', (req, res) => {
  const sql = 'SELECT * FROM entradas';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
