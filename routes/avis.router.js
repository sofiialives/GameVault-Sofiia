const { Router } = require('express')
const router = Router()
const avisController = require('../controllers/avis.controller');
const { isValidId, authenticate } = require('../middlewares');

router.delete('/:id', authenticate, isValidId, avisController.deleteAvis)

module.exports = router;
