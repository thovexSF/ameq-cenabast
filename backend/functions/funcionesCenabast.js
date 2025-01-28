const axios = require('axios');
const config = require('../config');

// Función para autenticar y obtener el token
async function authenticate() {
    try {
        const response = await axios.post(`${config.CENABAST_BASE_URL}/login/authenticate`, {
            Username: config.CENABAST_CREDENTIALS.USERNAME,
            Password: config.CENABAST_CREDENTIALS.PASSWORD
        });
        console.log('Token obtenido:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error autenticando:', error);
        throw error;
    }
}

// Función para informar el detalle de la guía de despacho
async function informarGuiaDespacho(detalleGuia, token) {
    try {
        console.log('Datos enviados:', JSON.stringify(detalleGuia, null, 2));
        const response = await axios.post(`${config.CENABAST_BASE_URL}/proveedor/distribucion`, detalleGuia, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Guía de despacho informada:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error al informar la guía de despacho:', error.response.data);
            console.error('Detalles del error:', error.response.status, error.response.headers);
            // Lanzar el error con el mensaje correcto
            throw new Error(error.response.data.Message);
        } else {
            console.error('Error al informar la guía de despacho:', error.message);
        }
    }
}

// Función para verificar movimientos existentes
async function verificarMovimientosExistentes(docCenabast) {
    try {
        const response = await axios.get(`${config.CENABAST_BASE_URL}/public/distribucion/${docCenabast}/movimiento`);
        
        // Verificar si no hay movimientos
        if (!response.data || response.data.length === 0) {
            throw new Error(`El Doc_Cenabast ${docCenabast} no existe en el sistema Cenabast`);
        }

        // Verificar si ya existe un movimiento con DescMovimiento: 1
        const movimientosEntrega = response.data.filter(mov => mov.DescMovimiento === 1);
        
        if (movimientosEntrega.length > 0) {
            throw new Error(`Ya existe un movimiento de entrega para el documento ${docCenabast}`);
        }
        
        return true;
    } catch (error) {
        // Si el error ya tiene un mensaje personalizado, lo propagamos
        if (error.message.includes('no existe en el sistema') || 
            error.message.includes('Ya existe un movimiento')) {
            throw error;
        }
        // Si es un error de la API (404, etc), lanzamos el error personalizado
        if (error.response?.status === 404) {
            throw new Error(`El Doc_Cenabast ${docCenabast} no existe en el sistema Cenabast`);
        }
        // Para otros errores de la API
        throw new Error(error.response?.data?.Message || `Error al verificar movimientos para el documento ${docCenabast}`);
    }
}

// Función para modificar el movimiento de entrega
async function informarFechaEntrega(docCenabast, movimiento, token) {
    try {
        // Primero verificamos si ya existe un movimiento
        try {
            await verificarMovimientosExistentes(docCenabast);
        } catch (error) {
            // Si es un error de verificación, lo propagamos inmediatamente
            throw error;
        }

        // Si la verificación fue exitosa, procedemos con el POST
        try {
            const response = await axios.post(
                `${config.CENABAST_BASE_URL}/proveedor/distribucion/${docCenabast}/movimiento`,
                movimiento,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Movimiento modificado:', response.data);
            return response.data;
        } catch (error) {
            // Si hay error en el POST, lanzamos un error específico
            throw new Error(error.response?.data?.Message || 'Error al crear el movimiento de entrega');
        }
    } catch (error) {
        throw error;
    }
}

// Función para actualizar la fecha de facturación
async function actualizarInfoFacturacion(docCenabast, factura, token) {
    try {
        const response = await axios.put(
            `${config.CENABAST_BASE_URL}/proveedor/distribucion/${docCenabast}`, 
            factura,  // Enviamos el objeto factura completo
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Info de facturación actualizada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la Info de facturación:', error.response?.data || error.message);
        throw new Error(error.response?.data?.Message || 'Error al actualizar la facturación');
    }
}

// Función para subir un documento en base64
async function subirDocumento(payload, token) {
    const response = await axios.post(
        `${config.CENABAST_BASE_URL}/proveedor/cedible`,
        {
            Doc_Cenabast: payload.Doc_Cenabast,
            Rut_Proveedor: payload.Rut_Proveedor,
            Documento: payload.Documento
        },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    return response;
}

// Función para obtener detalles del documento desde la API de Cenabast
async function obtenerDetallesDocumento(docCenabast, token) {
    try {
        const response = await axios.get(`${config.CENABAST_BASE_URL}/public/distribucion/${docCenabast}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.data || Object.keys(response.data).length === 0) {
            console.log(`⚠️ Distribución ${docCenabast} no encontrada en sistema Cenabast`);
            return null;
        }
        console.log(response.data)
        return response.data;
    } catch (error) {
        // Silenciosamente retornamos null en caso de error
        return null;
    }
}

module.exports = {
    authenticate,
    informarGuiaDespacho,
    informarFechaEntrega,
    actualizarInfoFacturacion,
    subirDocumento,
    obtenerDetallesDocumento,
};