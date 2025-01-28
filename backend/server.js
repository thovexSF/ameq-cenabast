const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const uploadRoutes = require('./routes/upload');

const app = express();

// Aumentar límite de payload
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Configuración de CORS
app.use(cors());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api', uploadRoutes);

// Ruta para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Todas las demás rutas sirven el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar servidor
app.listen(config.PORT, () => {
    console.log('=================================');
    console.log(`Servidor corriendo en el puerto ${config.PORT}`);
    console.log(`Ambiente: ${config.NODE_ENV}`);
    console.log(`URL Cenabast: ${config.CENABAST_BASE_URL}`);
    console.log('=================================');
});

module.exports = app;