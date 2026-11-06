const Joi = require('joi');

const inscriptionSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.email': 'L\'email n\'est pas valide',
        'string.empty': 'L\'email est obligatoire',
        'any.required': 'L\'email est obligatoire',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.empty': 'Le mot de passe est obligatoire',
        'any.required': 'Le mot de passe est obligatoire',
    }),
    pseudo: Joi.string().trim().min(2).max(30).required().messages({
        'string.min': 'Le pseudo doit contenir au moins 2 caractères',
        'string.max': 'Le pseudo ne peut pas dépasser 30 caractères',
        'string.empty': 'Le pseudo est obligatoire',
        'any.required': 'Le pseudo est obligatoire',
    }),
    role: Joi.any().strip(),
});

const connexionSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        'string.email': 'L\'email n\'est pas valide',
        'string.empty': 'L\'email est obligatoire',
        'any.required': 'L\'email est obligatoire',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Le mot de passe est obligatoire',
        'any.required': 'Le mot de passe est obligatoire',
    }),
});

const refreshSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Le refresh token est obligatoire',
        'any.required': 'Le refresh token est obligatoire',
    }),
});

module.exports = { inscriptionSchema, connexionSchema, refreshSchema };
