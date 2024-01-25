import { exec } from 'child_process';
import logger from '../utils/logger.mjs';
import { impresorasTodas } from '../consts/consts.mjs';

const regEnSuSitioOriginal = /(Impresora configurada|Configured printer)/gi;
let ok = Boolean;
let ip = String

export const desviarImpresoraOriginal = (printer, server) => {

    for (let impresora of impresorasTodas) {
        if (impresora.impresora === printer) {
            ip = impresora.ip;
        }
    }

    // Verifica si la IP existe y así no pegue trueno
    if (!ip) {
        return Promise.reject(new Error(`La impresora destino ${impresoraDestino} no se encontró en la lista de impresoras.`));
    }

    return new Promise((resolve, reject) => {

        exec(`cscript prncnfg.vbs -t -s ${server} -p ${printer} -r ${ip}`, { cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES' }, (error, stdout, stderr) => {

            //Si hay errores, que los muestre
            if (error) {
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer}. Stack trace: ${error.stack}`);
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer} stderr ${stderr}`);
                reject(error);
            };

            //Busca en el stdout si ha realizado la execución de manera correcta y la devuelvo.
            if (stdout.match(regEnSuSitioOriginal)) {
                ok = true
            } else { 
                ok = "error"
            }

            resolve(
                {
                    ok
                }
            );

        });
    });
};