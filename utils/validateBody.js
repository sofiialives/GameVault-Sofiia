const httpError = require("./errors/httpError");

const validateBody = (schema) => {
    const fn = (req, res, next) => {
        const { error, value } = schema.validate(req.body || {}, { abortEarly: false });
        if (error) {
            const details = error.details.map((d) => d.message);
            return next(httpError(400, "Données invalides", details));
        }
        req.body = value;
        next();
    };
    return fn;
};

module.exports = validateBody;
