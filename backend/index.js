const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();

// Aumentar límite de payload
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Configuración de CORS
app.use(cors());

// Rutas
const routes = require('./server');
app.use('/', routes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Iniciar servidor
app.listen(config.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${config.PORT}`);
    console.log(`Ambiente: ${config.NODE_ENV}`);
    console.log(`URL Cenabast: ${config.CENABAST_BASE_URL}`);
}); 