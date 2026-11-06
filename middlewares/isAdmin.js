const { httpError } = require("../utils");

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(httpError(403, 'Réservé aux administrateurs'));
    }
    next();
};

module.exports = isAdmin;
