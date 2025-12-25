import { exec } from 'child_process';
import logger from '../utils/logger.mjs';

export const purgarCola = (printer, server, userName) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnqctl.vbs -x -s ${server} -p ${printer}`, {
            cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES'
        }, (error, stdout, stderr) => {

            if (error) {
                logger.error(`Error al purgar cola de ${printer}. Usuario: ${userName}. Stack trace: ${error.stack}`);
                logger.error(`Error al purgar cola de ${printer} stderr ${stderr}`);
                reject(error);
                return;
            }

            // Verificar si la operación fue exitosa
            if (stdout.toLowerCase().includes('correcto') || stdout.toLowerCase().includes('success') || stdout.toLowerCase().includes('purg')) {
                logger.warn(`Cola de ${printer} purgada completamente por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    accion: "Cola purgada",
                    exito: true,
                    mensaje: `Todos los trabajos de ${printer} han sido eliminados`,
                    advertencia: "Esta operación ha eliminado TODOS los trabajos en cola"
                });
            } else if (stdout.toLowerCase().includes('error')) {
                logger.error(`Error al purgar cola de ${printer}. Output: ${stdout}`);
                resolve({
                    impresora: printer,
                    accion: "Purgar cola",
                    exito: false,
                    mensaje: "No se pudo purgar la cola. Puede que no tengas permisos suficientes.",
                    detalles: stdout
                });
            } else {
                // Si no podemos determinar el resultado, asumimos éxito si no hubo error de ejecución
                logger.warn(`Cola de ${printer} purgada por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    accion: "Cola purgada",
                    exito: true,
                    mensaje: `Cola de ${printer} procesada para purgado`,
                    advertencia: "Esta operación puede haber eliminado todos los trabajos en cola",
                    detalles: stdout
                });
            }
        });
    });
};
