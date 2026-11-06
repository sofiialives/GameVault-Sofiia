const { ctrlWrapper, httpError, sendEmail, messages } = require('../utils')
const userService = require('../services/user.service')
const jwt = require('jsonwebtoken')

const creerTokens = (user) => {
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET_KEY || process.env.SECRET_KEY, {
        expiresIn: process.env.REFRESH_EXPIRES_IN || "7d",
    });
    return { token, refreshToken };
}

const inscription = async (req, res) => {
    const { email, password, pseudo } = req.body;

    const user = await userService.findByEmail(email);
    if (user) throw httpError(409, 'Cet email est déjà utilisé');

    const newUser = await userService.newUser({ email, password, pseudo });
    if (!newUser) throw httpError(400, "Données invalides");

    sendEmail(messages.registerMessage(newUser.email, newUser.pseudo)).catch((err) =>
        console.error("Mail de bienvenue non envoyé :", err.message)
    );

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        pseudo: newUser.pseudo,
        role: newUser.role,
    });
}

const connexion = async (req, res) => {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);

    if (!user || !(await user.comparePassword(password)))
        throw httpError(401, "Email ou mot de passe incorrect");

    const { token, refreshToken } = creerTokens(user);
    await userService.findUserAndUpdate(user.id, { refreshToken });

    res.json({
        token,
        refreshToken,
        user: { id: user.id, email: user.email, pseudo: user.pseudo, role: user.role },
    });
}

const moi = async (req, res) => {
    res.json(req.user);
}

const deconnect = async (req, res) => {
    await userService.findUserAndUpdate(req.user.id, { refreshToken: null });
    res.status(204).end();
};

const refresh = async (req, res) => {
    const { refreshToken } = req.body;

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY || process.env.SECRET_KEY);
    } catch {
        throw httpError(401, "Refresh token invalide ou expiré");
    }

    const user = await userService.findByRefreshToken(refreshToken);
    if (!user || user.id !== payload.id) throw httpError(401, "Refresh token invalide ou expiré");

    const tokens = creerTokens(user);
    await userService.findUserAndUpdate(user.id, { refreshToken: tokens.refreshToken });

    res.json(tokens);
}

module.exports = {
    inscription: ctrlWrapper(inscription),
    connexion: ctrlWrapper(connexion),
    moi: ctrlWrapper(moi),
    deconnect: ctrlWrapper(deconnect),
    refresh: ctrlWrapper(refresh)
}
