const express 			= require('express');
const router 			= express.Router();
const swaggerUi 		= require('swagger-ui-express');
const swaggerJSDoc		= require('swagger-jsdoc');

const swaggerOptions = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Au Temps Donné ExpressJS API",
			version: "1.0.0",
			description: "Api documentation for developpers"
		}
	},
	explorer: true,
	swaggerOptions: {
		validatorUrl: null,
		url: "swagger.json"
	},
	apis: ["./*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;