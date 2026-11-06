const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
    jeu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jeux',
        required: [true, 'Selectionnez le jeu.'],
    },
    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Auteur est obligatoire.'],
    },
    note: {
        type: Number,
        min: [0, 'La note va de 0 à 20.'],
        max: [20, 'La note va de 0 à 20.'],
        required: [true, 'Note est obligatoire.'],
    },
    commentaire: {
        type: String,
        trim: true,
        maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères.'],
    }
}, { timestamps: true, versionKey: false });

avisSchema.index({ jeu: 1, auteur: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
