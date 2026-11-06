const { Router } = require('express')
const router = Router();
const jeuxController = require('../controllers/jeux.controller');
const { isValidId, authenticate, isAdmin, upload } = require('../middlewares')
const { validateBody } = require('../utils')
const schemas = require('../schemas')

router.get('/', jeuxController.getAll);
router.get('/:id', isValidId, jeuxController.getJeu);
router.get('/:id/avis', isValidId, jeuxController.getJeuxAvis)

router.post('/:id/avis', authenticate, isValidId, validateBody(schemas.ajoutAvis), jeuxController.ajoutAvis)

router.post('/', authenticate, isAdmin, validateBody(schemas.ajoutJeux), jeuxController.ajoutJeux);
router.put('/:id', authenticate, isAdmin, isValidId, validateBody(schemas.modifiJeux), jeuxController.modifierJeux);
router.delete('/:id', authenticate, isAdmin, isValidId, jeuxController.supprimeJeux)
router.post('/:id/jaquette', authenticate, isAdmin, isValidId, upload.single('jaquette'), jeuxController.image)

module.exports = router;
