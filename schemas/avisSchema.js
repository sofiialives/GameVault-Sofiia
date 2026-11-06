const Joi = require('joi');

const ajoutAvis = Joi.object({
    note: Joi.number().min(0).max(20).required().messages({
        'number.base': 'La note doit être un nombre',
        'number.min': 'La note va de 0 à 20',
        'number.max': 'La note va de 0 à 20',
        'any.required': 'La note est obligatoire',
    }),
    commentaire: Joi.string().trim().max(500).allow('').messages({
        'string.base': 'Le commentaire doit être un texte',
        'string.max': 'Le commentaire ne peut pas dépasser 500 caractères',
    }),
    auteur: Joi.any().strip(),
    jeu: Joi.any().strip(),
}).messages({
    'object.unknown': 'Le champ {#label} n\'est pas autorisé',
});

module.exports = { ajoutAvis };
