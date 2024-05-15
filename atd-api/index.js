const express           = require('express');
const config            = require("./config.json");
const logMiddleware     = require("./src/middlewares/logMiddleware");
const app               = express();
const fs                = require("fs");
const path              = require('path');
const port              = config.apiPort;
const routesPath        = path.join(__dirname, './src/routes');
const bodyParser        = require('body-parser');
const cors              = require('cors');
const multer            = require('multer');
const upload            = multer({ dest: 'uploads/' });
const dotenv            = require('dotenv').config();
// TEST TEST TEST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Permet de parser x-www-form-urlencoded
app.use(bodyParser.raw());
app.use(upload.any());  // Middleware multer pour parser le multipart/form-data

// Pour les log les routes requêtées
app.use(cors({
    origin: true,
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE", "OPTIONS"],
    //allowedHeaders: ["Access-Control-Allow-Headers", "Authorization", "Content-Type", "Access-Control-Allow-Origin"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));    // CORS (Cross origin request) pour autoriser les requêtes d'origines différentes
app.use(logMiddleware);

// Parcourt le répertoire routes afin de charger chaque fichier de route
fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
        const route = require(path.join(routesPath, file));
        app.use(route);
    }
});

// L'application écoute sur le port désigné
app.listen(port, () => {
    console.log("Serveur démarré sur le port :", port);
});


/**
 * @openapi
 * /:
 *  get:
 *      summary: Api Welcome Message
 *      tags: []
 *      responses:
 *          200:
 *              description: Welcome message
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          example:
 *                              message: "Welcome to the Api"
 */
app.get("/", (req, res) => {
    res.status(200).json({"message": "Welcome to the api"});
});

// Pour toutes les requêtes sur des routes non définies
app.use((req, res, next) => {
    res.status(404).json({error: "ressource not found", cause: "bad method or inexistant route"});
});