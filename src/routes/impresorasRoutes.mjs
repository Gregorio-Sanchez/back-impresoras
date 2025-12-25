// host + /impresoras
import logger from '../utils/logger.mjs';
import { Router, request, response } from 'express';
import dotenv from 'dotenv';
import {
    pausar,
    reanudar,
    trabajos,
    trabajosDetallados,
    estados,
    desviarImpresora,
    desviarImpresoraOriginal,
    imprimirPaginaPrueba,
    cancelarTrabajo,
    pausarTrabajo,
    reanudarTrabajo,
    purgarCola
} from '../controllers/index.mjs';

let numeroPeticiones = 0;

const router = Router();

//variables de entorno
dotenv.config();

router.get('/', async (req, res = response) => {

    let request = impresoras.map(impresora => trabajos(impresora))

    Promise.allSettled(request)

        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
        .finally(() => {
            numeroPeticiones++;
        })
});

router.get('/:nombreImpresora/:server', async (req, res = response) => {

    // console.log(req.query.almacen)
    // console.log(req.query.HUEVO)
    // console.log(req.kauth.grant.access_token.content.realm_access.roles);
    // console.log(req.kauth.grant);

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;

    logger.log(
        {
            level: 'mongodb',
            message: `Actualizar trabajo impresora ${nombreImpresora} por el usuario ${req.kauth.grant.access_token.content?.name}`
        }
    );

    let request = trabajos(nombreImpresora, server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

router.get('/:nombreImpresora/:server/pausa', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;

    logger.log(
        {
            level: 'mongodb',
            message: `Impresora ${nombreImpresora} pausada por el usuario ${req.kauth.grant.access_token.content?.name}`
        }
    );

    let request = pausar(nombreImpresora, server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

router.get('/:nombreImpresora/:server/reanuda', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;

    logger.log(
        {
            level: 'mongodb',
            message: `Impresora ${nombreImpresora} reanudada por el usuario ${req.kauth.grant.access_token.content?.name}`
        }
    );

    let request = reanudar(nombreImpresora, server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

router.get('/:nombreImpresora/:server/estado', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;

    let request = estados(nombreImpresora, server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

router.get('/:nombreImpresoraDesviada/:nombreImpresoraDestino/:server/desviar', async (req, res = response) => {

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${req.kauth.grant.access_token.content?.name} ha desviado la impresora ${req.params.nombreImpresoraDesviada} por la ${req.params.nombreImpresoraDestino} en el server ${req.params.server}`
        }
    );

    let request = desviarImpresora(req.params.nombreImpresoraDesviada, req.params.nombreImpresoraDestino, req.params.server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

router.get('/:nombreImpresora/:server/desviarImpresoraOriginal', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${req.kauth.grant.access_token.content?.name} ha devuelto a su ip original la impresora ${nombreImpresora}`
        }
    );

    let request = desviarImpresoraOriginal(nombreImpresora, server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

router.get('/:nombreImpresora/:server/pagPrueba', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;
    let userName = req.kauth.grant.access_token.content?.name || 'Usuario desconocido';

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${userName} ha impreso una página de prueba por ${nombreImpresora}`
        }
    );

    let request = imprimirPaginaPrueba(nombreImpresora, server, userName)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

// Endpoint para listar trabajos con detalles completos
router.get('/:nombreImpresora/:server/trabajosDetallados', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${req.kauth.grant.access_token.content?.name} ha solicitado trabajos detallados de ${nombreImpresora}`
        }
    );

    let request = trabajosDetallados(nombreImpresora, server)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

// Endpoint para cancelar un trabajo específico
router.get('/:nombreImpresora/:server/:jobId/cancelar', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;
    let jobId = req.params.jobId;
    let userName = req.kauth.grant.access_token.content?.name || 'Usuario desconocido';

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${userName} ha cancelado el trabajo ${jobId} de ${nombreImpresora}`
        }
    );

    let request = cancelarTrabajo(nombreImpresora, server, jobId, userName)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

// Endpoint para pausar un trabajo específico
router.get('/:nombreImpresora/:server/:jobId/pausarTrabajo', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;
    let jobId = req.params.jobId;
    let userName = req.kauth.grant.access_token.content?.name || 'Usuario desconocido';

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${userName} ha pausado el trabajo ${jobId} de ${nombreImpresora}`
        }
    );

    let request = pausarTrabajo(nombreImpresora, server, jobId, userName)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

// Endpoint para reanudar un trabajo específico
router.get('/:nombreImpresora/:server/:jobId/reanudarTrabajo', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;
    let jobId = req.params.jobId;
    let userName = req.kauth.grant.access_token.content?.name || 'Usuario desconocido';

    logger.log(
        {
            level: 'mongodb',
            message: `El usuario ${userName} ha reanudado el trabajo ${jobId} de ${nombreImpresora}`
        }
    );

    let request = reanudarTrabajo(nombreImpresora, server, jobId, userName)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

// Endpoint para purgar toda la cola de una impresora
router.get('/:nombreImpresora/:server/purgarCola', async (req, res = response) => {

    let nombreImpresora = req.params.nombreImpresora;
    let server = req.params.server;
    let userName = req.kauth.grant.access_token.content?.name || 'Usuario desconocido';

    logger.log(
        {
            level: 'mongodb',
            message: `ADVERTENCIA: El usuario ${userName} ha purgado TODA la cola de ${nombreImpresora}`
        }
    );

    let request = purgarCola(nombreImpresora, server, userName)
        .then((response) => res.json(response))
        .catch((error) => {
            res.status(500).json({ error: error ? error?.message : "Se ha ido a la puta" });
        })
});

// module.exports = router;

export default router;