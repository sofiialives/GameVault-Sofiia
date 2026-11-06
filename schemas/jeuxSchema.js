const Joi = require('joi');
const { PLATEFORMES, GENRES, PEGI, ANNEE_MAX } = require('../models/jeux.mongo');

const champs = {
    titre: Joi.string().trim().min(1).max(150).messages({
        'string.base': 'Le titre doit être un texte',
        'string.empty': 'Le titre est obligatoire',
        'string.max': 'Le titre ne peut pas dépasser 150 caractères',
        'any.required': 'Le titre est obligatoire',
    }),
    editeur: Joi.string().trim().min(1).max(100).messages({
        'string.base': 'L\'éditeur doit être un texte',
        'string.empty': 'L\'éditeur est obligatoire',
        'any.required': 'L\'éditeur est obligatoire',
    }),
    annee: Joi.number().integer().min(1970).max(ANNEE_MAX).messages({
        'number.base': 'L\'année doit être un nombre',
        'number.integer': 'L\'année doit être un nombre entier',
        'number.min': `L'année va de 1970 à ${ANNEE_MAX}`,
        'number.max': `L'année va de 1970 à ${ANNEE_MAX}`,
        'any.required': 'L\'année est obligatoire',
    }),
    plateformes: Joi.array().items(Joi.string().valid(...PLATEFORMES)).min(1).unique().messages({
        'array.base': 'Les plateformes doivent être une liste',
        'array.min': 'Au moins une plateforme est requise',
        'array.unique': 'Une plateforme est en double',
        'any.only': `Plateforme inconnue (valeurs possibles : ${PLATEFORMES.join(', ')})`,
        'any.required': 'Au moins une plateforme est requise',
    }),
    genres: Joi.array().items(Joi.string().valid(...GENRES)).min(1).unique().messages({
        'array.base': 'Les genres doivent être une liste',
        'array.min': 'Au moins un genre est requis',
        'array.unique': 'Un genre est en double',
        'any.only': `Genre inconnu (valeurs possibles : ${GENRES.join(', ')})`,
        'any.required': 'Au moins un genre est requis',
    }),
    pegi: Joi.number().valid(...PEGI).messages({
        'number.base': 'Le PEGI doit être un nombre',
        'any.only': 'Le PEGI doit être 3, 7, 12, 16 ou 18',
        'any.required': 'Le PEGI est obligatoire',
    }),
    note: Joi.number().min(0).max(20).messages({
        'number.base': 'La note doit être un nombre',
        'number.min': 'La note va de 0 à 20',
        'number.max': 'La note va de 0 à 20',
        'any.required': 'La note est obligatoire',
    }),
    multijoueur: Joi.boolean().messages({
        'boolean.base': 'Multijoueur doit être vrai ou faux',
    }),
    prix: Joi.number().min(0).precision(2).messages({
        'number.base': 'Le prix doit être un nombre',
        'number.min': 'Le prix doit être positif ou nul',
        'any.required': 'Le prix est obligatoire',
    }),
};

const messagesObjet = {
    'object.unknown': 'Le champ {#label} n\'est pas autorisé',
    'object.min': 'Envoyez au moins un champ à modifier',
};

const ajoutJeux = Joi.object({
    titre: champs.titre.required(),
    editeur: champs.editeur.required(),
    annee: champs.annee.required(),
    plateformes: champs.plateformes.required(),
    genres: champs.genres.required(),
    pegi: champs.pegi.required(),
    note: champs.note.required(),
    multijoueur: champs.multijoueur.default(false),
    prix: champs.prix.required(),
}).messages(messagesObjet);

const modifiJeux = Joi.object(champs).min(1).messages(messagesObjet);

module.exports = { ajoutJeux, modifiJeux };
