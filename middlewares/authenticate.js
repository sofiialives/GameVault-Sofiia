const jwt = require("jsonwebtoken");
const { httpError } = require("../utils/");
const userService = require("../services/user.service");

const authenticate = async (req, res, next) => {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer" || !token) return next(httpError(401, "Connexion requise"));

    try {
        const { id } = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userService.findById(id);

        if (!user) return next(httpError(401, "Connexion requise"));
        req.user = user;
        next();
    } catch (error) {
        next(httpError(401, "Token invalide ou expiré"));
    }
};

module.exports = authenticate;
