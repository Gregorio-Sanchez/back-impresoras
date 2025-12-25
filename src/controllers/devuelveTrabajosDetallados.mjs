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

    // Regex para capturar información de trabajos en español (formato real de Windows)
    // El formato real es:
    // Id. de trabajo 267918
    // Impresora 11ALSAF02
    // Documento PSCCLNT020/P010000567506_1
    // Propietario SYSTEM
    // Páginas imprimidas 1
    // Tamaño 48
    // Estado Error asociado al trabajo El trabajo se está imprimiendo
    // Hora de envío 12/24/2025 14:16:10
    // Número total de páginas 0

    const regJobId = /Id\.\s+de\s+trabajo\s+(\d+)/i;
    const regEstado = /Estado\s+(.+?)[\r\n]/i;  // Capturar contenido hasta salto de línea
    const regPropietario = /Propietario\s+(\S+)/i;
    const regPaginasImpresas = /P.ginas\s+imprimidas\s+(\d+)/i;
    const regTotalPaginas = /N.mero\s+total\s+de\s+p.ginas\s+(\d+)/i;
    const regTamano = /Tama.o\s+(\d+)/i;
    const regFecha = /Hora\s+de\s+env.o\s+(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2})/i;
    const regDocumento = /Documento\s+(\S+)/i;

    // Dividir por trabajos (cada trabajo empieza con "Id. de trabajo")
    const jobBlocks = stdout.split(/(?=Id\.\s+de\s+trabajo\s+\d+)/i);

    for (let block of jobBlocks) {
        if (!block.trim()) continue;

        // Normalizar saltos de línea para que las regex funcionen mejor
        const normalizedBlock = block.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const jobIdMatch = normalizedBlock.match(regJobId);
        if (!jobIdMatch) continue;

        const estadoMatch = normalizedBlock.match(regEstado);
        const propietarioMatch = normalizedBlock.match(regPropietario);
        const paginasImpresasMatch = normalizedBlock.match(regPaginasImpresas);
        const totalPaginasMatch = normalizedBlock.match(regTotalPaginas);
        const tamanoMatch = normalizedBlock.match(regTamano);
        const fechaMatch = normalizedBlock.match(regFecha);
        const documentoMatch = normalizedBlock.match(regDocumento);

        // Intentar obtener el número de páginas (preferir "Número total de páginas", sino "Páginas imprimidas")
        let paginas = 0;
        if (totalPaginasMatch && totalPaginasMatch[1]) {
            paginas = parseInt(totalPaginasMatch[1]);
        } else if (paginasImpresasMatch && paginasImpresasMatch[1]) {
            paginas = parseInt(paginasImpresasMatch[1]);
        }

        // Convertir tamaño de bytes a MB
        let tamanoMB = "0 MB";
        if (tamanoMatch && tamanoMatch[1]) {
            const bytes = parseInt(tamanoMatch[1]);
            const mb = (bytes / (1024 * 1024)).toFixed(2);
            tamanoMB = `${mb} MB`;
        }

        // Limpiar el estado - si está vacío usar "En cola"
        let estadoLimpio = "En cola";
        if (estadoMatch && estadoMatch[1]) {
            const estadoTexto = estadoMatch[1].trim();
            // Verificar que no esté vacío y no contenga "Hora de env"
            if (estadoTexto &&
                estadoTexto.length > 0 &&
                !estadoTexto.toLowerCase().includes('hora de env') &&
                !estadoTexto.includes('¡')) {  // Detectar caracteres raros del encoding
                estadoLimpio = estadoTexto;
            }
        }

        const job = {
            jobId: parseInt(jobIdMatch[1]),
            estado: estadoLimpio.replace(/\s{2,}/g, ' '),  // Limpiar espacios múltiples
            propietario: propietarioMatch ? propietarioMatch[1].trim().split(/\s+/)[0] : "Desconocido",
            paginas: paginas,
            tamano: tamanoMB,
            fechaEnvio: fechaMatch ? fechaMatch[1].trim() : null,
            documento: documentoMatch ? documentoMatch[1].trim() : "Sin nombre",
            puerto: null
        };

        jobs.push(job);
    }

    return jobs;
}
