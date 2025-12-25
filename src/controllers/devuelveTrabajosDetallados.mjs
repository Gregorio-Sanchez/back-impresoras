import { exec } from 'child_process';
import logger from '../utils/logger.mjs';

export const trabajosDetallados = (printer, server) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prnjobs.vbs -l -s ${server} -p ${printer}`, {
            cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES',
            encoding: 'latin1'
        }, (error, stdout, stderr) => {

            if (error) {
                logger.error(`Error al devolver trabajos detallados de ${printer}. Stack trace: ${error.stack}`);
                logger.error(`Error al devolver trabajos detallados de ${printer} stderr ${stderr}`);
                reject(error);
                return;
            }

            try {
                const jobs = parseJobs(stdout);

                resolve({
                    impresora: printer,
                    totalTrabajos: jobs.length,
                    trabajos: jobs,
                    error: false,
                    ok: true
                });
            } catch (parseError) {
                logger.error(`Error parseando trabajos de ${printer}: ${parseError.message}`);
                resolve({
                    impresora: printer,
                    totalTrabajos: 0,
                    trabajos: [],
                    error: true,
                    mensaje: "Error parseando información de trabajos",
                    rawOutput: stdout
                });
            }
        });
    });
};

function parseJobs(stdout) {
    const jobs = [];

    // Regex para capturar información de trabajos en español
    // El formato típico es:
    // Trabajo Id 45
    // Estado: Imprimiendo
    // Propietario: DOMINIO\usuario
    // Páginas: 3
    // Tamaño: 12345
    // Enviado el: 23/11/2025 14:30:15
    // Documento: archivo.pdf

    const regJobId = /(trabajo|job)\s+(id\s+)?(\d+)/gi;
    const regEstado = /estado[:\s]+(.*?)$/gim;
    const regPropietario = /propietario[:\s]+(.*?)(\s+notif|$)/gim;
    const regPaginas = /p[áa]ginas[:\s]+(\d+)/gi;
    const regTamano = /tama[ñn]o[:\s]+([\d,]+)/gi;
    const regFecha = /enviado[:\s]+.*?(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/gi;
    const regDocumento = /documento[:\s]+(.*?)$/gim;
    const regPuerto = /puerto[:\s]+(.*?)$/gim;

    // Dividir por trabajos (cada trabajo empieza con "Trabajo Id")
    const jobBlocks = stdout.split(/(?=trabajo\s+id\s+\d+)/gi);

    for (let block of jobBlocks) {
        if (!block.trim()) continue;

        // Resetear índices de las regex
        regJobId.lastIndex = 0;
        regEstado.lastIndex = 0;
        regPropietario.lastIndex = 0;
        regPaginas.lastIndex = 0;
        regTamano.lastIndex = 0;
        regFecha.lastIndex = 0;
        regDocumento.lastIndex = 0;
        regPuerto.lastIndex = 0;

        const jobIdMatch = regJobId.exec(block);
        if (!jobIdMatch) continue;

        const estadoMatch = regEstado.exec(block);
        const propietarioMatch = regPropietario.exec(block);
        const paginasMatch = regPaginas.exec(block);
        const tamanoMatch = regTamano.exec(block);
        const fechaMatch = regFecha.exec(block);
        const documentoMatch = regDocumento.exec(block);
        const puertoMatch = regPuerto.exec(block);

        const job = {
            jobId: parseInt(jobIdMatch[3]),
            estado: estadoMatch ? estadoMatch[1].trim() : "Desconocido",
            propietario: propietarioMatch ? propietarioMatch[1].trim() : "Desconocido",
            paginas: paginasMatch ? parseInt(paginasMatch[1]) : 0,
            tamano: tamanoMatch ? tamanoMatch[1].trim() : "0",
            fechaEnvio: fechaMatch ? fechaMatch[1].trim() : null,
            documento: documentoMatch ? documentoMatch[1].trim() : "Sin nombre",
            puerto: puertoMatch ? puertoMatch[1].trim() : null
        };

        jobs.push(job);
    }

    return jobs;
}
