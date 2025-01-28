const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const multer = require('multer');
const {authenticate, informarGuiaDespacho, obtenerDetallesDocumento, informarFechaEntrega, actualizarInfoFacturacion, subirDocumento} = require('./functions/funcionesCenabast');
const { generarDespachos } = require('./functions/guiasDespacho');
const { readInvoiceFile } = require('./functions/Facturas');  
const { procesarArchivoEntrega } = require('./functions/FechaEntrega');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware para parsear JSON y form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuración de CORS
if (config.NODE_ENV === 'development') {
    app.use(cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
    }));
} else {
    app.use(cors());
}

// Rutas de la API
app.use('/api', uploadRoutes);

// Ruta para subir y procesar guías de despacho
app.post('/uploadGuiaDespacho', multer({ storage: multer.memoryStorage() }).single('file'), async (req, res) => {
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
          Detalles: distribucion.Detalles || [],
          mensaje: error.message || 'Error desconocido'
        });
      }
    }

    res.json({
      despachos: resultados.map(despacho => ({
        ...despacho,
        Detalles: despacho.Detalles || [],
        mensaje: despacho.mensaje
      })),
      status: 'warning'
    });

  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ 
      error: 'Error al procesar el archivo',
      message: error.message || 'Error desconocido'
    });
  }
});

// Ruta para informar fechas de entrega
app.post('/uploadEntrega', multer({ storage: multer.memoryStorage() }).single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        const token = await authenticate();
        const entregas = await procesarArchivoEntrega(req.file.buffer);
        const resultados = [];

        for (const entrega of entregas) {
            try {
                await informarFechaEntrega(entrega.Doc_Cenabast, {
                    Doc_Cenabast: entrega.Doc_Cenabast,
                    Fecha: entrega.Fecha,
                    Hora: entrega.Hora,
                    DescMovimiento: entrega.DescMovimiento,
                    RecibidoPor: entrega.RecibidoPor
                }, token);

                resultados.push({
                    Doc_Cenabast: entrega.Doc_Cenabast,
                    Fecha_Entrega: entrega.Fecha,
                    mensaje: 'Procesado exitosamente'
                });
            } catch (error) {
                // Usamos el mensaje de error original
                resultados.push({
                    Doc_Cenabast: entrega.Doc_Cenabast,
                    Fecha_Entrega: entrega.Fecha,
                    mensaje: error.message || 'Error al procesar la entrega'
                });
            }
        }

        console.log('Enviando respuesta:', { despachos: resultados });
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
app.post('/uploadInvoice', multer({ storage: multer.memoryStorage() }).single('file'), async (req, res) => {
    console.log('Iniciando procesamiento de factura...');
    
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    try {
        const token = await authenticate();
        const facturas = readInvoiceFile(req.file.buffer);
        
        if (!facturas || facturas.length === 0) {
            return res.status(400).json({ error: 'No se encontraron facturas en el archivo.' });
        }

        console.log(`Se encontraron ${facturas.length} facturas para procesar`);
        const resultados = [];

        for (const factura of facturas) {
            try {
                // Primero obtenemos los detalles del documento
                const detalles = await obtenerDetallesDocumento(factura.Doc_Cenabast, token);
                
                if (!detalles) {
                    resultados.push({
                        ...factura,
                        mensaje: 'Doc_Cenabast no encontrado en Sistema Cenabast'
                    });
                    continue;
                }

                // Combinamos la información de la factura con los detalles
                const facturaCompleta = {
                    ...factura,
                    IdDistribucion: detalles.IdDistribucion,
                    Guia: detalles.Guia,
                    Fecha_Gui: detalles.Fecha_Gui,
                    O_Trans: detalles.O_Trans,
                    Detalles: detalles.Detalles || [],
                    Movimientos: detalles.Movimientos || []
                };

                await actualizarInfoFacturacion(factura.Doc_Cenabast, facturaCompleta, token);
                resultados.push({
                    ...facturaCompleta,
                    mensaje: 'Procesado exitosamente'
                });

            } catch (error) {
                console.error(`Error procesando factura ${factura.Doc_Cenabast}:`, error);
                resultados.push({
                    ...factura,
                    mensaje: error.message || 'Error al actualizar la facturación'
                });
            }
        }

        // Modificamos el formato de la respuesta para la tabla
        res.json({
            despachos: resultados.map(resultado => ({
                Doc_Cenabast: resultado.Doc_Cenabast,
                Factura: resultado.Factura,
                Fecha_Fac: resultado.Fecha_Fac,
                Guia: resultado.Guia || 'N/A',
                Fecha_Gui: resultado.Fecha_Gui || 'N/A',
                O_Trans: resultado.O_Trans || 'N/A',
                Detalles: resultado.Detalles?.map(detalle => ({
                    Articulo: detalle.Articulo || 'N/A',
                    Lote: detalle.Lote || 'N/A',
                    Cantidad: detalle.Cantidad || 0
                })) || [],
                mensaje: resultado.mensaje
            }))
        });

    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        res.status(500).json({ 
            error: 'Error al procesar el archivo',
            mensaje: error.message 
        });
    }
});

// Ruta para subir documentos cedibles
app.post('/uploadDocument', async (req, res) => {
    try {
        const { docCenabast, rutProveedor, documento } = req.body;
        
        console.log('=== Información del Documento Cedible ===');
        console.log('Payload:', {
            Doc_Cenabast: parseInt(docCenabast),
            Rut_Proveedor: rutProveedor,
            Documento: `[BASE64 STRING - ${documento.length} chars]`
        });

        const token = await authenticate();
        const response = await subirDocumento({
            Doc_Cenabast: parseInt(docCenabast),
            Rut_Proveedor: rutProveedor,
            Documento: documento
        }, token);
        
        console.log('=== Respuesta exitosa de API Cenabast ===');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        
        res.json({
            success: true,
            message: 'Documento cedible subido exitosamente',
            data: response.data
        });

    } catch (error) {
        console.error('=== Error al subir documento cedible ===');
        console.error('Error completo:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            message: error.response?.data?.Message || error.message
        });
    }
});

// Servir archivos estáticos en producción
if (config.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

// Manejo de errores de multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Archivo demasiado grande',
                message: 'El archivo no debe superar los 10MB'
            });
        }
        return res.status(400).json({
            error: 'Error al subir archivo',
            message: err.message
        });
    }
    next(err);
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: config.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Iniciar servidor
app.listen(config.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${config.PORT}`);
    console.log(`Ambiente: ${config.NODE_ENV}`);
    console.log(`URL Cenabast: ${config.CENABAST_BASE_URL}`);
});