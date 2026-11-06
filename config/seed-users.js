require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.mongo');
const Jeux = require('../models/jeux.mongo');
const Avis = require('../models/avis.mongo');

const users = [
    { email: 'admin@gamevault.fr', password: 'Admin1234', pseudo: 'Admin', role: 'admin' },
    { email: 'ada@gamevault.fr', password: 'Joueur1234', pseudo: 'Ada', role: 'user' },
    { email: 'linus@gamevault.fr', password: 'Joueur1234', pseudo: 'Linus', role: 'user' },
];

const avis = [
    { titre: 'The Legend of Zelda: Tears of the Kingdom', pseudo: 'Ada', note: 17, commentaire: 'Un monde immense, on s’y perd avec plaisir.' },
    { titre: 'Elden Ring', pseudo: 'Ada', note: 19, commentaire: 'Difficile mais tellement gratifiant.' },
    { titre: 'Elden Ring', pseudo: 'Linus', note: 16, commentaire: 'Superbe, mais j’ai rage-quit plusieurs fois.' },
    { titre: "Baldur's Gate 3", pseudo: 'Linus', note: 20, commentaire: 'Le meilleur RPG de ces dernières années.' },
];

const seedUsers = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await Avis.deleteMany({});
    await User.deleteMany({});
    await User.syncIndexes();
    await Avis.syncIndexes();

    const crees = {};
    for (const u of users) {
        const user = await User.create(u);
        crees[u.pseudo] = user;
    }
    console.log(`${users.length} comptes créés (admin@gamevault.fr / Admin1234)`);

    let nb = 0;
    for (const a of avis) {
        const jeu = await Jeux.findOne({ titre: a.titre });
        if (!jeu) continue;
        await Avis.create({ jeu: jeu._id, auteur: crees[a.pseudo]._id, note: a.note, commentaire: a.commentaire });
        nb++;
    }
    console.log(`${nb} avis créés`);
    await mongoose.disconnect();
};

if (require.main === module) {
    seedUsers().catch(async (err) => {
        console.error('Seed users échoué :', err.message);
        await mongoose.disconnect();
        process.exit(1);
    });
}

module.exports = { users, seedUsers };
