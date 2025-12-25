import { exec } from 'child_process';
import logger from '../utils/logger.mjs';

export const cancelarTrabajo = (printer, server, jobId, userName) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnjobs.vbs -x -s ${server} -p ${printer} -j ${jobId}`, {
            cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES'
        }, (error, stdout, stderr) => {

            if (error) {
                logger.error(`Error al cancelar trabajo ${jobId} en ${printer}. Usuario: ${userName}. Stack trace: ${error.stack}`);
                logger.error(`Error al cancelar trabajo ${jobId} en ${printer} stderr ${stderr}`);
                reject(error);
                return;
            }

            // Verificar si la operación fue exitosa
            if (stdout.toLowerCase().includes('correcto') || stdout.toLowerCase().includes('success') || stdout.toLowerCase().includes('cancel')) {
                logger.info(`Trabajo ${jobId} cancelado en ${printer} por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    jobId: parseInt(jobId),
                    accion: "Trabajo cancelado",
                    exito: true,
                    mensaje: `Trabajo ${jobId} cancelado correctamente en ${printer}`
                });
            } else if (stdout.toLowerCase().includes('error') || stdout.toLowerCase().includes('no se encuentra') || stdout.toLowerCase().includes('not found')) {
                logger.warn(`Error al cancelar trabajo ${jobId} en ${printer}. Output: ${stdout}`);
                resolve({
                    impresora: printer,
                    jobId: parseInt(jobId),
                    accion: "Cancelar trabajo",
                    exito: false,
                    mensaje: "El trabajo no se pudo cancelar. Puede que ya no exista o no tengas permisos.",
                    detalles: stdout
                });
            } else {
                // Si no podemos determinar el resultado, asumimos éxito si no hubo error de ejecución
                logger.info(`Trabajo ${jobId} cancelado en ${printer} por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    jobId: parseInt(jobId),
                    accion: "Trabajo cancelado",
                    exito: true,
                    mensaje: `Trabajo ${jobId} procesado para cancelación`,
                    detalles: stdout
                });
            }
        });
    });
};
