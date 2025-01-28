require('dotenv').config();

const config = {
    // Variables de entorno para Railway
    PORT: process.env.PORT || 3002,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // URLs de Cenabast
    CENABAST_URLS: {
        TEST: 'https://testaplicacionesweb.cenabast.cl:7001/WebApi/api/v1',
        PROD: 'https://aplicacionesweb.cenabast.cl/WebApi/api/v1'
    },
    
    // Credenciales
    CENABAST_CREDENTIALS: {
        USERNAME: process.env.CENABAST_USERNAME || "76209836",
        PASSWORD: process.env.CENABAST_PASSWORD || "k3IdtG3lBMck`&lt;]"
    },

    // Determinar URL base según ambiente
    get CENABAST_BASE_URL() {
        return this.NODE_ENV === 'production' 
            ? this.CENABAST_URLS.PROD 
            : this.CENABAST_URLS.TEST;
    }
};

module.exports = config; 