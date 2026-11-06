const mongoose = require('mongoose');

const PLATEFORMES = ['PC', 'PS5', 'PS4', 'Xbox Series', 'Switch', 'Mobile'];
const GENRES = ['action', 'aventure', 'rpg', 'fps', 'sport', 'course', 'strategie', 'simulation', 'plateforme', 'combat', 'horreur', 'puzzle'];
const PEGI = [3, 7, 12, 16, 18];
const ANNEE_MAX = new Date().getFullYear() + 1;

const jeuxSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: [true, 'Le titre est obligatoire.'],
        unique: true,
        trim: true
    },
    editeur: {
        type: String,
        required: [true, 'L\'éditeur est obligatoire.'],
        trim: true
    },
    annee: {
        type: Number,
        required: [true, 'L\'année est obligatoire.'],
        min: [1970, 'L\'année doit être comprise entre 1970 et ' + ANNEE_MAX + '.'],
        max: [ANNEE_MAX, 'L\'année doit être comprise entre 1970 et ' + ANNEE_MAX + '.'],
        validate: {
            validator: Number.isInteger,
            message: 'L\'année doit être un nombre entier.',
        },
    },
    plateformes: {
        type: [{
            type: String,
            enum: { values: PLATEFORMES, message: 'Plateforme inconnue : {VALUE}.' },
        }],
        validate: {
            validator: v => Array.isArray(v) && v.length > 0,
            message: 'Au moins une plateforme est requise.',
        },
    },
    genres: {
        type: [{
            type: String,
            enum: { values: GENRES, message: 'Genre inconnu : {VALUE}.' },
        }],
        validate: {
            validator: v => Array.isArray(v) && v.length > 0,
            message: 'Au moins un genre est requis.',
        },
    },
    pegi: {
        type: Number,
        required: [true, 'Le PEGI est obligatoire.'],
        enum: { values: PEGI, message: 'Le PEGI doit être 3, 7, 12, 16 ou 18.' },
    },
    note: {
        type: Number,
        required: [true, 'La note est obligatoire.'],
        min: [0, 'La note va de 0 à 20.'],
        max: [20, 'La note va de 0 à 20.'],
    },
    multijoueur: {
        type: Boolean,
        default: false,
    },
    prix: {
        type: Number,
        required: [true, 'Le prix est obligatoire.'],
        min: [0, 'Le prix doit être positif ou nul.'],
    },
    jaquette: {
        type: String,
        default: null,
    }
}, { timestamps: true, versionKey: false });

const Jeux = mongoose.model('Jeux', jeuxSchema);

module.exports = Jeux;
module.exports.PLATEFORMES = PLATEFORMES;
module.exports.GENRES = GENRES;
module.exports.PEGI = PEGI;
module.exports.ANNEE_MAX = ANNEE_MAX;
