const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
    authenticate,
    informarGuiaDespacho,
    obtenerDetallesDocumento,
    informarFechaEntrega,
    actualizarInfoFacturacion,
    subirDocumento
} = require('../functions/funcionesCenabast');
const { generarDespachos } = require('../functions/guiasDespacho');
const { readInvoiceFile } = require('../functions/Facturas');
const { procesarArchivoEntrega } = require('../functions/FechaEntrega');

// Ruta para subir y procesar guías de despacho
router.post('/uploadGuiaDespacho', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const despachos = await generarDespachos(req.file.buffer);
        res.json({ despachos });
    } catch (error) {
        console.error('Error en /uploadGuiaDespacho:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para informar fechas de entrega
router.post('/uploadEntrega', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const despachos = await procesarArchivoEntrega(req.file.buffer);
        res.json({ despachos });
    } catch (error) {
        console.error('Error en /uploadEntrega:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para subir y procesar facturas
router.post('/uploadInvoice', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const despachos = await readInvoiceFile(req.file.buffer);
        res.json({ despachos });
    } catch (error) {
        console.error('Error en /uploadInvoice:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para subir documentos cedibles
router.post('/uploadDocument', async (req, res) => {
    try {
        const { docCenabast, rutProveedor, documento } = req.body;
        
        if (!docCenabast || !rutProveedor || !documento) {
            return res.status(400).json({ 
                error: 'Faltan datos requeridos (docCenabast, rutProveedor o documento)' 
            });
        }

        // Obtener token de autenticación
        const authResponse = await authenticate();
        if (!authResponse || !authResponse.Token) {
            throw new Error('No se pudo obtener el token de autenticación');
        }

        // Subir el documento
        const response = await subirDocumento({
            Doc_Cenabast: docCenabast,
            Rut_Proveedor: rutProveedor,
            Documento: documento
        }, authResponse.Token);

        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error en /uploadDocument:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 