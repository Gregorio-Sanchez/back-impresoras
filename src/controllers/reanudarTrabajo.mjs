import { exec } from 'child_process';
import logger from '../utils/logger.mjs';

export const reanudarTrabajo = (printer, server, jobId, userName) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnjobs.vbs -m -s ${server} -p ${printer} -j ${jobId}`, {
            cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES'
        }, (error, stdout, stderr) => {

            if (error) {
                logger.error(`Error al reanudar trabajo ${jobId} en ${printer}. Usuario: ${userName}. Stack trace: ${error.stack}`);
                logger.error(`Error al reanudar trabajo ${jobId} en ${printer} stderr ${stderr}`);
                reject(error);
                return;
            }

            // Verificar si la operación fue exitosa
            if (stdout.toLowerCase().includes('correcto') || stdout.toLowerCase().includes('success') || stdout.toLowerCase().includes('reanud')) {
                logger.info(`Trabajo ${jobId} reanudado en ${printer} por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    jobId: parseInt(jobId),
                    accion: "Trabajo reanudado",
                    exito: true,
                    mensaje: `Trabajo ${jobId} reanudado correctamente en ${printer}`
                });
            } else if (stdout.toLowerCase().includes('error') || stdout.toLowerCase().includes('no se encuentra') || stdout.toLowerCase().includes('not found')) {
                logger.warn(`Error al reanudar trabajo ${jobId} en ${printer}. Output: ${stdout}`);
                resolve({
                    impresora: printer,
                    jobId: parseInt(jobId),
                    accion: "Reanudar trabajo",
                    exito: false,
                    mensaje: "El trabajo no se pudo reanudar. Puede que ya no exista o no tengas permisos.",
                    detalles: stdout
                });
            } else {
                // Si no podemos determinar el resultado, asumimos éxito si no hubo error de ejecución
                logger.info(`Trabajo ${jobId} reanudado en ${printer} por usuario ${userName}`);
                resolve({
                    impresora: printer,
                    jobId: parseInt(jobId),
                    accion: "Trabajo reanudado",
                    exito: true,
                    mensaje: `Trabajo ${jobId} procesado para reanudación`,
                    detalles: stdout
                });
            }
        });
    });
};
