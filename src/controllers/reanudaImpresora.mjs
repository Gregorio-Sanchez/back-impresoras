import { exec } from 'child_process';
import logger from '../utils/logger.mjs';
const regexCorrecto = /(Correcto|Success)/gi;
let ok = Boolean;

export const reanudar = (printer, server) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnqctl.vbs -m -s ${server} -p ${printer}`, { cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES' }, (error, stdout, stderr) => {

            //Si hay errores, que los muestre
            if (error) {
                logger.error(`Error al devolver datos cuando actualiza trabajos de ${printer}. Stack trace: ${error.stack}`);
                logger.error(`Error al devolver datos cuando actualiza trabajos de ${printer}. stderr ${stderr}`);
                reject(error);
            }

            //Si la impresora devuelve Correcto entontes pusa = true
            if (stdout.match(regexCorrecto)) {
                ok = true
            } else { ok = "error" }

            resolve(
                {
                    ok
                }
            )
        });
    });
};