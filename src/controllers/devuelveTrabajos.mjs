import { exec } from 'child_process';
import logger from '../utils/logger.mjs';
const regexNumImp = /\d+$/g;
const regexError = /error/gi;
// const regFechaPrimerTrabajo = /^(hora|time).*?$/gim;
const regFechaPrimerTrabajo = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
let fechaPrimerTrabajo = "";
const regId = /(trabajo|id).(\d+)/i;
let idPrimerTrabajo = 1;

export const trabajos = (printer, server) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnjobs.vbs -l -s ${server} -p ${printer}`, { cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES', encoding: 'latin1' }, (error, stdout, stderr) => {

            //Si hay errores, que los muestre
            if (error) {
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer}. Stack trace: ${error.stack}`);
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer} stderr ${stderr}`);
                reject(error);
            };

            //result es el array que tiene los trabajos en cola cuando la impresora es llamada
            const result = stdout.replace(/\r\n/g, '').match(regexNumImp);
            fechaPrimerTrabajo = stdout.match(regFechaPrimerTrabajo);
            idPrimerTrabajo = stdout.match(regId);

            //Si la impresora tiene un "error" en el stdout devuelvo true en el campo "error"
            if (stdout.match(regexError)) {
                error = true
            } else { error = false }

            //Si hay algún trabajo hará match con algo distinto a null
            if (fechaPrimerTrabajo === null) {
                fechaPrimerTrabajo = [null, null]
            }

            if (idPrimerTrabajo === null) {
                idPrimerTrabajo = [null, null]
            }

            resolve(
                {
                    impresora: printer,
                    valor: result !== null ? (result[0] !== null ? result[0] : "E") : "E",
                    error,
                    fechaPrimerTrabajo: fechaPrimerTrabajo[0],
                    idUltimoTrabajo: idPrimerTrabajo[2],
                    ok: true
                }
            );
        });
    });
};