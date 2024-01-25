import { exec } from 'child_process';
import logger from '../utils/logger.mjs';
import { impresorasTodas } from '../consts/consts.mjs';
const regInactiva = /inactivo|idle/gi;
const regImprimiendo = /imprimiendo|printing/gi;
const regPausa = /pausado|paused/gi;
const regSinPapel = /No\s\hay\s\papel|no\s\paper/gi;
const regSinConexion = /Sin conexi|offline/gi;
const regLowToner = /falta t|low toner/gi;
const noToner = /Sin t|no toner/gi;
const regError = /Error/g;
const regIp = /172\.30\.\d+\.\d+/g;
let ip = "";
let desviada = false;
let impresoraDesvio = "Sin desviar";

export const estados = (printer, server) => {

    return new Promise((resolve, reject) => {

        exec(`cscript prncnfg.vbs -g -s ${server} -p ${printer}`, { cwd: 'C:\\Windows\\System32\\Printing_Admin_Scripts\\es-ES' }, (error, stdout, stderr) => {

            //Si hay errores, que los muestre
            if (error) {
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer}. Stack trace: ${error.stack}`);
                logger.error(`Error al devolver datos cuando solicita el estado de ${printer} stderr ${stderr}`);
                reject(error);
            };

            ip = stdout.match(regIp);

           //Si el valor de ip es null o undefined entonces es porque hay error en lo que devuelve prncnfg 
            if (!ip) {
                resolve({
                    impresora: printer,
                    estado: "AVISAD AL ADMINISTRADOR",
                    desviada: "AVISAD AL ADMINISTRADOR",
                    impresoraDesvio: "AVISAD AL ADMINISTRADOR"
                });
                return;
            }

            //Comparo el puerto del stdout con el puerto que tiene predefinido la impresora. Si hay diferencias es que la impresora está desviada.

            for (let impresora of impresorasTodas) {

                if (impresora.impresora === printer && ip[0] === impresora.ip) {

                    desviada = false;

                } else if (impresora.impresora === printer && ip[0] != impresora.ip) {
                    desviada = true;
                    impresoraDesvio = impresorasTodas.find(impresora => impresora.ip === ip[0])
                }
            }

            //Busco el estado de la impresora en el stdout y lo devuelvo, si la impresoraDesvio es undefined entonces lo envío.
            if (stdout.match(regInactiva)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "INACTIVA",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(regImprimiendo)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "IMPRIMIENDO",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(regPausa)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "PAUSADA",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(regSinPapel)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "SIN PAPEL",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(regSinConexion)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "SIN CONEXION",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(regLowToner)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "TÓNER BAJO",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(noToner)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "NO TÓNER",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else if (stdout.match(regError)) {

                resolve(
                    {
                        impresora: printer,
                        estado: "ERROR",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );

            } else {
                resolve(
                    {
                        impresora: printer,
                        estado: "PROBABLEMENTE ERROR",
                        desviada,
                        impresoraDesvio: impresoraDesvio?.impresora || "No encuentro IP, probablemente impresora cambiada",
                        ip: ip[0]
                    }
                );
            }
        });
    });
};