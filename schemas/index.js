const authSchema = require('./authSchema')
const jeuxSchema = require('./jeuxSchema')
const avisSchema = require('./avisSchema')

module.exports = { ...authSchema, ...jeuxSchema, ...avisSchema }
