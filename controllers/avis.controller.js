const { ctrlWrapper, httpError } = require("../utils")
const avisService = require("../services/avis.service")

const deleteAvis = async (req, res) => {
    const { id } = req.params;
    const avis = await avisService.findAvis(id);
    if (!avis) throw httpError(404, "Avis introuvable");

    const estAuteur = avis.auteur.toString() === req.user.id;
    const estAdmin = req.user.role === "admin";
    if (!estAuteur && !estAdmin) throw httpError(403, "Ce n’est pas votre avis");

    await avisService.deleteAvis(id);
    res.status(204).end();
}

module.exports = { deleteAvis: ctrlWrapper(deleteAvis) }
