process.env.NODE_ENV = 'test';
process.env.SECRET_KEY = process.env.SECRET_KEY || 'secret_de_test';
process.env.REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'refresh_secret_de_test';

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const User = require('../models/user.mongo');
const Jeux = require('../models/jeux.mongo');
const Avis = require('../models/avis.mongo');

let memoryServer = null;

const connecter = async (nomBase) => {
    if (process.env.MONGO_URI_TEST) {
        await mongoose.connect(process.env.MONGO_URI_TEST, { dbName: `gamevault_test_${nomBase}` });
    } else {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        await mongoose.connect(memoryServer.getUri(), { dbName: nomBase });
    }
    await mongoose.connection.dropDatabase();
    await Promise.all([User.syncIndexes(), Jeux.syncIndexes(), Avis.syncIndexes()]);
};

const deconnecter = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (memoryServer) await memoryServer.stop();
};

const creerCompte = async ({ email, pseudo = 'Testeur', password = 'motdepasse123', role = 'user' }) => {
    const user = await User.create({ email, pseudo, password, role });
    const res = await request(app).post('/api/v1/auth/connexion').send({ email, password });
    return { user, token: res.body.token };
};

const jeuValide = (extra = {}) => ({
    titre: 'Jeu de test',
    editeur: 'Studio Test',
    annee: 2023,
    plateformes: ['PC'],
    genres: ['action'],
    pegi: 12,
    note: 15,
    multijoueur: false,
    prix: 19.99,
    ...extra,
});

module.exports = { app, request, connecter, deconnecter, creerCompte, jeuValide, User, Jeux, Avis };
