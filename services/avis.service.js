const Avis = require("../models/avis.mongo");

class avisService {
    constructor() { }

    async findAvisByJeu(jeuId) {
        return Avis.find({ jeu: jeuId })
            .populate("auteur", "pseudo")
            .sort({ createdAt: -1 })
            .lean();
    }

    async isAvisExists(jeuId, auteurId) {
        return Avis.exists({ jeu: jeuId, auteur: auteurId });
    }

    async createAvis({ jeu, auteur, note, commentaire }) {
        return Avis.create({ jeu, auteur, note, commentaire });
    }

    async findAvis(id) {
        return Avis.findById(id);
    }

    async deleteAvis(id) {
        return Avis.findByIdAndDelete(id);
    }
}

module.exports = new avisService();
