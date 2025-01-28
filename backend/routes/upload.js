const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configuración de multer con más opciones
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: function (req, file, cb) {
        // Verificar tipo de archivo
        if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
            file.mimetype === "application/vnd.ms-excel") {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
        }
    }
});

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
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        const token = await authenticate();
        console.log('Token obtenido:', token);
        
        const buffer = req.file.buffer;
        const distribuciones = await generarDespachos(buffer);
        console.log('Distribuciones a procesar:', distribuciones.length);
        
        const resultados = [];
        for (const distribucion of distribuciones) {
            try {
                await informarGuiaDespacho(distribucion, token);
                resultados.push({
                    ...distribucion,
                    mensaje: 'Procesado exitosamente'
                });
            } catch (error) {
                resultados.push({
                    ...distribucion,
                    mensaje: error.message || 'Error desconocido'
                });
            }
        }

        res.json({
            despachos: resultados,
            status: resultados.some(r => r.mensaje !== 'Procesado exitosamente') ? 'warning' : 'success'
        });

    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ 
            error: 'Error al procesar el archivo',
            message: error.message 
        });
    }
});

// Ruta para informar fechas de entrega
router.post('/uploadEntrega', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const token = await authenticate();
        const entregas = await procesarArchivoEntrega(req.file.buffer);
        const resultados = [];

        for (const entrega of entregas) {
            try {
                await informarFechaEntrega(entrega, token);
                resultados.push({
                    ...entrega,
                    mensaje: 'Procesado exitosamente'
                });
            } catch (error) {
                resultados.push({
                    ...entrega,
                    mensaje: error.message || 'Error al procesar la entrega'
                });
            }
        }

        res.json({ 
            despachos: resultados,
            status: resultados.some(r => r.mensaje !== 'Procesado exitosamente') ? 'warning' : 'success'
        });

    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ 
            error: 'Error al procesar el archivo',
            message: error.message 
        });
    }
});

// Ruta para subir y procesar facturas
router.post('/uploadInvoice', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
        }

        const token = await authenticate();
        const facturas = await readInvoiceFile(req.file.buffer);
        const resultados = [];

        for (const factura of facturas) {
            try {
                const detalles = await obtenerDetallesDocumento(factura.Doc_Cenabast, token);
                await actualizarInfoFacturacion(factura, token);
                resultados.push({
                    ...factura,
                    ...detalles,
                    mensaje: 'Procesado exitosamente'
                });
            } catch (error) {
                resultados.push({
                    ...factura,
                    mensaje: error.message || 'Error al procesar la factura'
                });
            }
        }

        res.json({
            despachos: resultados,
            status: resultados.some(r => r.mensaje !== 'Procesado exitosamente') ? 'warning' : 'success'
        });

    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ 
            error: 'Error al procesar el archivo',
            message: error.message 
        });
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

        const token = await authenticate();
        const response = await subirDocumento({
            Doc_Cenabast: docCenabast,
            Rut_Proveedor: rutProveedor,
            Documento: documento
        }, token);

        res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error al subir documento:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 