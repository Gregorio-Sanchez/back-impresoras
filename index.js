import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import corsOptions from './src/controllers/funciones.mjs';
import router from './src/routes/impresorasRoutes.mjs';
import 'winston-mongodb';
import logger from './src/utils/logger.mjs';
import dbConnection from './src/database/config.mjs';
import { keycloak, sessionMiddle } from './keycloak.mjs'

//variables de entorno
dotenv.config();

logger.log("info", `Iniciando servicio ${process.env.MICRONAME}`);

//Crear servidor Express
const app = express();

//Conectar con la base de datos
// dbConnection();

// corsOptions;
app.options('*', cors(corsOptions));

app.use(cors(corsOptions));

//Directorio público.
app.use(express.static('public'));

// Lectura y parseo del body
app.use(express.json());

app.use(sessionMiddle);

app.use(keycloak.middleware());

// console.log(keycloak.getConfig());

//TODO: devolver trabajos y demás trabajos
app.use('/', keycloak.protect(), router);
// app.use('/impresoras', keycloak.protect(), router);

//Escuchar peticiones
app.listen(process.env.PORT, () => {

    logger.log('info', `Servidor corriendo en puerto ${process.env.PORT}`)

});