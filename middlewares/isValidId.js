const { isValidObjectId } = require("mongoose");
const { httpError } = require("../utils");

const isValidId = (req, res, next) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return next(httpError(400, "Identifiant invalide"));
    }
    next();
};

module.exports = isValidId;
