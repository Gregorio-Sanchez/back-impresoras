import { exec } from 'child_process';
import logger from '../utils/logger.mjs';

export const imprimirPaginaPrueba = (printer, server, userName) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnqctl.vbs -e -s ${server} -p ${printer}`, {
            cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES'
        }, (error, stdout, stderr) => {

            if (error) {
                logger.error(`Error al imprimir página de prueba en ${printer}. Usuario: ${userName}. Stack trace: ${error.stack}`);
                logger.error(`Error al imprimir página de prueba en ${printer} stderr ${stderr}`);
                reject(error);
                return;
            }

            // Verificar si la operación fue exitosa
            if (stdout.toLowerCase().includes('correcto') || stdout.toLowerCase().includes('success')) {
                logger.info(`Página de prueba enviada a ${printer} por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    accion: "Página de prueba enviada",
                    exito: true,
                    mensaje: `Página de prueba enviada correctamente a ${printer}`
                });
            } else if (stdout.toLowerCase().includes('error')) {
                logger.warn(`Posible error al imprimir página de prueba en ${printer}. Output: ${stdout}`);
                resolve({
                    impresora: printer,
                    accion: "Página de prueba enviada",
                    exito: false,
                    mensaje: "La operación puede haber fallado",
                    detalles: stdout
                });
            } else {
                // Si no podemos determinar el resultado, asumimos éxito si no hubo error de ejecución
                logger.info(`Página de prueba enviada a ${printer} por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    accion: "Página de prueba enviada",
                    exito: true,
                    mensaje: `Página de prueba enviada a ${printer}`,
                    detalles: stdout
                });
            }
        });
    });
};
