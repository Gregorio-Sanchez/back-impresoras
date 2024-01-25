import { exec } from 'child_process';
import logger from '../utils/logger.mjs';
import { impresorasTodas } from '../consts/consts.mjs';

const regIsDesviada = /(Impresora configurada|Configured printer)/gi;
let ok = Boolean;
let ip = String

export const desviarImpresora = (impresoraDesviada, impresoraDestino, server) => {

    for (let impresora of impresorasTodas) {
        if (impresora.impresora === impresoraDestino) {
            ip = impresora.ip;
        }
    }

    // Verifica si la IP existe y así no pegue trueno
    if (!ip) {
        return Promise.reject(new Error(`La impresora destino ${impresoraDestino} no se encontró en la lista de impresoras.`));
    }

    return new Promise((resolve, reject) => {

        exec(`cscript prncnfg.vbs -t -s ${server} -p ${impresoraDesviada} -r ${ip}`, { cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES' }, (error, stdout, stderr) => {

            //Si hay errores, que los muestre
            if (error) {
                logger.error(`Error al desviar la impresora: ${impresoraDesviada}. Stack trace: ${error.stack}`);
                logger.error(`Error al desviar la impresora: ${impresoraDesviada}. stderr ${stderr}`);
                reject(error);
            }

            //Busco el estado de la impresora en el stdout y lo devuelvo
            if (stdout.match(regIsDesviada)) {
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