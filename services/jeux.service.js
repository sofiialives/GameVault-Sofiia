const Jeux = require("../models/jeux.mongo");
const Avis = require("../models/avis.mongo");

const TRIS = ["note", "annee", "titre", "prix"];
const LIMITE_DEFAUT = 10;
const LIMITE_MAX = 50;

const echapper = (texte) => String(texte).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

class jeuxService {
    constructor() { }

    pagination(query = {}) {
        const page = Math.max(1, parseInt(query.page) || 1);
        const limite = Math.min(LIMITE_MAX, Math.max(1, parseInt(query.limite) || LIMITE_DEFAUT));

        const filtre = {};
        if (query.recherche) {
            filtre.titre = { $regex: echapper(query.recherche), $options: "i" };
        }
        if (query.plateforme) {
            filtre.plateformes = { $regex: `^${echapper(query.plateforme)}$`, $options: "i" };
        }
        if (query.genre) {
            filtre.genres = { $regex: `^${echapper(query.genre)}$`, $options: "i" };
        }
        const pegiMax = Number(query.pegiMax);
        if (query.pegiMax !== undefined && !Number.isNaN(pegiMax)) {
            filtre.pegi = { $lte: pegiMax };
        }
        const noteMin = Number(query.noteMin);
        if (query.noteMin !== undefined && !Number.isNaN(noteMin)) {
            filtre.note = { $gte: noteMin };
        }

        const champTri = TRIS.includes(query.tri) ? query.tri : "note";
        const ordreParDefaut = champTri === "note" ? -1 : 1;
        const ordre = query.ordre === "asc" ? 1 : query.ordre === "desc" ? -1 : ordreParDefaut;
        const tri = { [champTri]: ordre, _id: 1 }; 

        return { filtre, tri, page, limite };
    }

    async getJeux(query) {
        const { filtre, tri, page, limite } = this.pagination(query);

        const [donnees, total] = await Promise.all([
            Jeux.find(filtre).sort(tri).skip((page - 1) * limite).limit(limite).lean(),
            Jeux.countDocuments(filtre),
        ]);

        return {
            donnees,
            pagination: { page, limite, total, pages: Math.ceil(total / limite) },
        };
    }

    async findJeu(id) {
        return Jeux.findById(id);
    }

    async isJeuxExists(titre, excludeId = null) {
        if (!titre) return false;
        const filtre = { titre: { $regex: `^${echapper(titre.trim())}$`, $options: "i" } };
        if (excludeId) filtre._id = { $ne: excludeId };
        return Jeux.exists(filtre);
    }

    async createJeux(data) {
        return Jeux.create(data);
    }

    async updatedJeux(updates, id) {
        return Jeux.findByIdAndUpdate(id, updates, {
            returnDocument: "after",
            runValidators: true,
        });
    }

    async deleted(id) {
        const jeu = await Jeux.findByIdAndDelete(id);
        if (jeu) await Avis.deleteMany({ jeu: id });
        return jeu;
    }

    async updateJaquette(id, chemin) {
        return Jeux.findByIdAndUpdate(id, { jaquette: chemin }, { returnDocument: "after" });
    }
}

module.exports = new jeuxService();
