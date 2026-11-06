const fs = require('fs')
const path = require('path')
const jeuxService = require('../services/jeux.service')
const avisService = require('../services/avis.service')
const { ctrlWrapper, httpError } = require('../utils')

const getAll = async (req, res) => {
    const resultat = await jeuxService.getJeux(req.query);
    res.json(resultat);
}

const getJeu = async (req, res) => {
    const { id } = req.params;
    const jeu = await jeuxService.findJeu(id);
    if (!jeu) throw httpError(404, 'Jeu introuvable');
    res.json(jeu);
}

const ajoutJeux = async (req, res) => {
    const jeuxExiste = await jeuxService.isJeuxExists(req.body.titre);
    if (jeuxExiste) throw httpError(409, 'Ce titre existe déjà')

    const jeu = await jeuxService.createJeux(req.body);
    res.status(201).json(jeu)
}

const modifierJeux = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const jeu = await jeuxService.findJeu(id);
    if (!jeu) throw httpError(404, 'Jeu introuvable');

    if (updates.titre && await jeuxService.isJeuxExists(updates.titre, id)) {
        throw httpError(409, 'Ce titre existe déjà');
    }

    const updateJeux = await jeuxService.updatedJeux(updates, id);
    if (!updateJeux) throw httpError(404, 'Jeu introuvable');

    res.json(updateJeux);
}

const supprimeJeux = async (req, res) => {
    const { id } = req.params;
    const deleteJeux = await jeuxService.deleted(id);
    if (!deleteJeux) throw httpError(404, 'Jeu introuvable')

    res.status(204).end()
}

const getJeuxAvis = async (req, res) => {
    const { id } = req.params;
    const jeu = await jeuxService.findJeu(id);
    if (!jeu) throw httpError(404, 'Jeu introuvable');

    const avis = await avisService.findAvisByJeu(id);
    res.json(avis);
}

const ajoutAvis = async (req, res) => {
    const { id } = req.params;
    const auteur = req.user.id;
    const { note, commentaire } = req.body;

    const jeu = await jeuxService.findJeu(id);
    if (!jeu) throw httpError(404, 'Jeu introuvable');

    const dejaDonne = await avisService.isAvisExists(id, auteur);
    if (dejaDonne) throw httpError(409, 'Vous avez déjà donné votre avis sur ce jeu');

    const avis = await avisService.createAvis({ jeu: id, auteur, note, commentaire });
    res.status(201).json(avis);
}

const image = async (req, res) => {
    const { id } = req.params;
    if (!req.file) throw httpError(400, 'Aucune image envoyée (champ "jaquette")');

    const jeu = await jeuxService.findJeu(id);
    if (!jeu) {
        fs.unlink(req.file.path, () => { });
        throw httpError(404, 'Jeu introuvable');
    }

    if (jeu.jaquette) {
        const ancien = path.join(__dirname, '..', jeu.jaquette);
        fs.unlink(ancien, () => { });
    }

    const chemin = `/uploads/jaquettes/${req.file.filename}`;
    const jeuMisAJour = await jeuxService.updateJaquette(id, chemin);
    res.json(jeuMisAJour);
}

module.exports = {
    getAll: ctrlWrapper(getAll),
    getJeu: ctrlWrapper(getJeu),
    ajoutJeux: ctrlWrapper(ajoutJeux),
    modifierJeux: ctrlWrapper(modifierJeux),
    supprimeJeux: ctrlWrapper(supprimeJeux),
    getJeuxAvis: ctrlWrapper(getJeuxAvis),
    ajoutAvis: ctrlWrapper(ajoutAvis),
    image: ctrlWrapper(image),
}
