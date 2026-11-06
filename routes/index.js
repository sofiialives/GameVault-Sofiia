const { Router } = require('express')
const authRoutes = require('./auth.router')
const avisRoutes = require('./avis.router')
const jeuxRoutes = require('./jeux.router')

const router = Router();

router.use('/auth', authRoutes)
router.use('/avis', avisRoutes)
router.use('/jeux', jeuxRoutes)

module.exports = router
