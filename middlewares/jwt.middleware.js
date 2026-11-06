const jwt = require('jsonwebtoken');

exports.verifierToken = (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ erreur: 'Connexion requise' });
    }
    try {
        req.user = jwt.verify(token, process.env.SECRET_KEY);
        next();
    } catch {
        return res.status(401).json({ erreur: 'Token invalide ou expiré' })
    }
}
exports.reserveAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ erreur: 'Réservé aux administrateurs' });
    }
    next();
}
