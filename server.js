require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const connectMongo = require("./config/mongo");
const cors = require("cors");
const winston = require("winston");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const routes = require("./routes");

const PORT = process.env.PORT || 10000;

const logDirectory = path.join(__dirname, 'logs');
if(!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory)
}

const logger = winston.createLogger({
    level: 'info',
    silent: process.env.NODE_ENV === 'test',
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(({timestamp,level,message}) => {
            return `[${timestamp}] [${level.toUpperCase()}] : ${message}`
        })
    ),
    transports: [
        new winston.transports.File({filename: path.join(logDirectory,'access.txt')}),
        new winston.transports.File({filename: path.join(logDirectory,'errors.txt'), level: 'error'}),
        new winston.transports.Console()
    ]
})

const morganStream = {
    write: (message) => logger.info(message.trim())
}
app.use(morgan('combined',{stream: morganStream}))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '100kb' }));

const rateLimit = require('express-rate-limit');

const limiteConnexion = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { erreur: "Trop de tentatives, réessayez plus tard" }
});
app.use('/api/v1/auth/connexion', limiteConnexion);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1', routes);

app.use((req, res) => {
    res.status(404).json({ erreur: "Route introuvable" });
});

app.use((err, req, res, next) => {
    if (err.status && err.status < 500 && !err.type) {
        const body = { erreur: err.message };
        if (err.details) body.details = err.details;
        return res.status(err.status).json(body);
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ erreur: "JSON invalide" });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ erreur: "Corps de requête trop volumineux" });
    }
    if (err instanceof multer.MulterError) {
        const erreur = err.code === 'LIMIT_FILE_SIZE'
            ? "L'image ne doit pas dépasser 2 Mo"
            : "Fichier invalide (champ attendu : jaquette)";
        return res.status(400).json({ erreur });
    }
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ erreur: "Données invalides", details });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ erreur: "Identifiant invalide" });
    }
    if (err.code === 11000) {
        const champs = Object.keys(err.keyPattern || err.keyValue || {});
        let erreur = "Cette ressource existe déjà";
        if (champs.includes('titre')) erreur = "Ce titre existe déjà";
        else if (champs.includes('email')) erreur = "Cet email est déjà utilisé";
        else if (champs.includes('auteur')) erreur = "Vous avez déjà donné votre avis sur ce jeu";
        return res.status(409).json({ erreur });
    }

    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
    res.status(500).json({ erreur: "Erreur interne du serveur" });
});

if(require.main === module){
    connectMongo();
    app.listen(PORT, () => {
       logger.info(`Le serveur a demarre sur le port ${PORT} - docs : http://localhost:${PORT}/api/docs`)
    })
}

module.exports = app;
