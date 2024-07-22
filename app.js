const express = require('express');  // Importa Express
const mysql = require('mysql');      // Importa MySQL para la base de datos
const multer = require('multer');    // Importa Multer para la gestión de archivos
const path = require('path');        // Importa el módulo 'path' de Node.js

const app = express();  // Crea una instancia de la aplicación Express
const port = 3000;      // Define el puerto en el que la aplicación va a escuchar

// Creando conexión de la base de datos con MySQL
const db = mysql.createConnection({
  host: 'localhost',    // Host de la base de datos
  user: 'root',         // Usuario de la base de datos
  password: '',         // Contraseña de la base de datos
  database: 'tallerdb', // Nombre de la base de datos a la que conectar
  port: 3306            // Puerto de la base de datos MySQL
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
    cb(null, './public/uploads/');  // Directorio donde se almacenarán los archivos subidos
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para el archivo basado en la fecha actual y la extensión original del archivo
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');  // Establece EJS como motor de plantillas
app.set('views', path.join(__dirname, 'views'));  // Define la carpeta de vistas

// Middleware para parsear datos del formulario y servir archivos estáticos
app.use(express.urlencoded({ extended: false }));  // Middleware para parsear datos del formulario
app.use(express.static(path.join(__dirname, 'public')));  // Middleware para servir archivos estáticos

// Ruta para el formulario de subida de entradas
app.get('/', (req, res) => {
  res.render('formulario');  // Renderiza el formulario para subir entradas
});

// Ruta para mostrar los datos en index.ejs
app.get('/index', (req, res) => {
  res.render('index');  // Renderiza la página principal del sitio
});

// Ruta API para obtener las entradas en formato JSON
app.get('/api/entradas', (req, res) => {
  const sql = 'SELECT * FROM entradas';  // Consulta SQL para seleccionar todas las entradas
  db.query(sql, (err, results) => {      // Ejecuta la consulta SQL en la base de datos
    if (err) {
      return res.status(500).json({ error: err.message });  // Maneja errores devolviendo un JSON con el error
    }
    res.json(results);  // Retorna las entradas en formato JSON
  });
});

// Rutas CRUD adicionales

// Ruta para mostrar todas las entradas en el sitio
app.get('/entradas', (req, res) => {
  const sql = 'SELECT * FROM entradas';  // Consulta SQL para seleccionar todas las entradas
  db.query(sql, (err, results) => {      // Ejecuta la consulta SQL en la base de datos
    if (err) {
      return res.status(500).json({ error: err.message });  // Maneja errores devolviendo un JSON con el error
    }
    res.render('entradas', { entradas: results });  // Renderiza la página de entradas con los datos obtenidos
  });
});

// Ruta para procesar el envío de un nuevo formulario de entrada
app.post('/confirmacion', upload.single('imagen'), (req, res) => {
  const { titulo, comentario } = req.body;          
  const imagen = req.file ? req.file.filename : null;  
  const sqlInsert = 'INSERT INTO entradas (titulo, comentario, imagen) VALUES (?, ?, ?)';  
  
  db.query(sqlInsert, [titulo, comentario, imagen], (err, result) => {  
    if (err) {
      throw err;  
    }
    console.log('Entrada insertada en la base de datos');
    const sqlSelect = 'SELECT * FROM entradas WHERE id = ?';
    db.query(sqlSelect, [result.insertId], (err, rows) => {
      if (err) {
        throw err;
      }
      const entrada = rows[0];
      res.render('confirmacion', { 
        titulo: entrada.titulo, 
        comentario: entrada.comentario, 
        imagen: entrada.imagen, 
        fecha_agregado: entrada.fecha_agregado 
      });
    });
  });
});

// Ruta para editar una entrada específica
app.get('/edit/:id', (req, res) => {
  const { id } = req.params;      // Obtiene el ID de la entrada a editar
  const sql = 'SELECT * FROM entradas WHERE id = ?';  // Consulta SQL para seleccionar una entrada por su ID
  db.query(sql, [id], (err, result) => {  // Ejecuta la consulta SQL en la base de datos
    if (err) {
      return res.status(500).json({ error: err.message });  // Maneja errores devolviendo un JSON con el error
    }
    if (result.length === 0) {
      return res.status(404).send('Entrada no encontrada');  // Maneja el caso en que no se encuentre la entrada
    }
    res.render('edit', { entrada: result[0] });  // Renderiza la página de edición con los datos de la entrada específica
  });
});

// Ruta para procesar la actualización de una entrada específica
app.post('/update/:id', upload.single('imagen'), (req, res) => {
  const { id } = req.params;      // Obtiene el ID de la entrada a actualizar
  const { titulo, comentario } = req.body;  // Obtiene los datos actualizados del formulario
  const imagen = req.file ? req.file.filename : req.body.existingImagen;  // Obtiene el nombre del archivo subido

  const sql = 'UPDATE entradas SET titulo = ?, comentario = ?, imagen = ? WHERE id = ?';  // Consulta SQL para actualizar una entrada por su ID
  db.query(sql, [titulo, comentario, imagen, id], (err, result) => {  // Ejecuta la consulta SQL en la base de datos
    if (err) {
      return res.status(500).json({ error: err.message });  // Maneja errores devolviendo un JSON con el error
    }
    console.log('Entrada actualizada en la base de datos');
    res.redirect('/entradas');  // Redirige a la página de entradas después de actualizar la entrada
  });
});

// Ruta para eliminar una entrada específica
app.get('/delete/:id', (req, res) => {
  const { id } = req.params;      // Obtiene el ID de la entrada a eliminar
  const sql = 'DELETE FROM entradas WHERE id = ?';  // Consulta SQL para eliminar una entrada por su ID
  db.query(sql, [id], (err, result) => {  // Ejecuta la consulta SQL en la base de datos
    if (err) {
      return res.status(500).json({ error: err.message });  // Maneja errores devolviendo un JSON con el error
    }
    console.log('Entrada eliminada de la base de datos');
    res.redirect('/entradas');  // Redirige a la página de entradas después de eliminar la entrada
  });
});

// Iniciar el servidor y escuchar en el puerto definido
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);  // Imprime un mensaje cuando el servidor se inicia correctamente
});
