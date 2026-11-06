const { Router } = require('express')
const router = Router();
const { validateBody } = require('../utils');
const schemas = require("../schemas/authSchema");
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares')


router.post('/inscription', validateBody(schemas.inscriptionSchema), userController.inscription);
router.post('/connexion', validateBody(schemas.connexionSchema), userController.connexion);
router.get('/moi', authenticate, userController.moi)
router.post('/rafraichir', validateBody(schemas.refreshSchema), userController.refresh)
router.post('/deconnexion', authenticate, userController.deconnect)

module.exports = router;
