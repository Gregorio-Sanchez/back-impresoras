import { exec } from 'child_process';
import logger from '../utils/logger.mjs';
const regexError = /error/gi;
const regFechaPrimerTrabajo = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/;
let fechaPrimerTrabajo = "";
const regId = /(trabajo|id).(\d+)/i;
let idPrimerTrabajo = 1;
// Regex para capturar el número total de trabajos desde la línea final del output
const regexNumeroTotalTrabajos = /N[úu]mero de trabajos de impresi[óo]n enumerados\s+(\d+)/i;
// Regex alternativa para contar manualmente (cada trabajo empieza con "Id. de trabajo")
const regexContarTrabajos = /Id\.\s+de\s+trabajo\s+\d+/gi;

export const trabajos = (printer, server) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnjobs.vbs -l -s ${server} -p ${printer}`, { cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES', encoding: 'latin1' }, (error, stdout, stderr) => {

            //Si hay errores, que los muestre
            if (error) {
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer}. Stack trace: ${error.stack}`);
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer} stderr ${stderr}`);
                reject(error);
            };

            // Primero intentamos obtener el número desde la línea final "Número de trabajos de impresión enumerados X"
            let numeroTrabajos = 0;
            const matchNumeroTotal = stdout.match(regexNumeroTotalTrabajos);

            if (matchNumeroTotal && matchNumeroTotal[1]) {
                // Si encontramos la línea con el total, usamos ese número
                numeroTrabajos = parseInt(matchNumeroTotal[1]);
            } else {
                // Si no, contamos manualmente las ocurrencias de "Id. de trabajo"
                const trabajosEncontrados = stdout.match(regexContarTrabajos);
                numeroTrabajos = trabajosEncontrados ? trabajosEncontrados.length : 0;
            }

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
                    valor: numeroTrabajos.toString(),
                    error,
                    fechaPrimerTrabajo: fechaPrimerTrabajo ? fechaPrimerTrabajo[0] : null,
                    idUltimoTrabajo: idPrimerTrabajo ? idPrimerTrabajo[2] : null,
                    ok: true
                }
            );
        });
    });
};