import Keycloak from 'keycloak-connect';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();


// const kcConfig =
// {
//     realm: "hefame-ldap-tst",
//     serverUrl: "https://keycloak.hefame.es/",
//     clientId: "node-sapsprint1",
//     bearerOnly: true,
//     enabled: false,
//     realmPublicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAszbQgj2WzK8h4bPE28aM7HmjaFGbrwgTqUfo+scEh7x//OnoCmjroMuj5Agkew4P/Iw0h6ELswd5H84lfNzrPYR1/TQ357wOQNDSS7imBV2OR7U59w90MhgKH0h3Igp8w9xjRzTmmh+MlX5X+CY1GDw86oS9QL5bnFe8N6quGvfj10j4J6J2sAGw3mpwcuTuSmeBoAHT75j5E3K1iQLHBY+fKf00u37ncmEdwO9njrE4ktqJ9fuGX08rrvGjbJTYVasJsCE/mcxYqMbSY2T+TxnOUbv9ZEg02aVKEjjQMgDzLna8da5ZcaYGX9M8U8NZ+UWaGMoNILyPRPbglVxGaQIDAQAB",
// };


const memoryStore = new session.MemoryStore();

export const sessionMiddle = session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    store: memoryStore
});

export const keycloak = new Keycloak({
    store: memoryStore,
    debug: true
});