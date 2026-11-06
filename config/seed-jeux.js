require('dotenv').config();
const mongoose = require('mongoose');
const Jeux = require('../models/jeux.mongo');
const Avis = require('../models/avis.mongo');

const jeux = [
    { titre: "Elden Ring", editeur: "Bandai Namco", annee: 2022, plateformes: ["PC", "PS5", "PS4", "Xbox Series"], genres: ["rpg", "action"], pegi: 16, note: 19, multijoueur: true, prix: 59.99 },
    { titre: "Baldur's Gate 3", editeur: "Larian Studios", annee: 2023, plateformes: ["PC", "PS5", "Xbox Series"], genres: ["rpg", "strategie"], pegi: 18, note: 19, multijoueur: true, prix: 59.99 },
    { titre: "The Legend of Zelda: Tears of the Kingdom", editeur: "Nintendo", annee: 2023, plateformes: ["Switch"], genres: ["action", "aventure"], pegi: 12, note: 19, multijoueur: false, prix: 69.99 },
    { titre: "The Witcher 3: Wild Hunt", editeur: "CD Projekt", annee: 2015, plateformes: ["PC", "PS5", "PS4", "Xbox Series", "Switch"], genres: ["rpg", "aventure"], pegi: 18, note: 18, multijoueur: false, prix: 29.99 },
    { titre: "Persona 5 Royal", editeur: "Atlus", annee: 2022, plateformes: ["PC", "PS5", "PS4", "Xbox Series", "Switch"], genres: ["rpg"], pegi: 16, note: 18, multijoueur: false, prix: 49.99 },
    { titre: "Final Fantasy VII Rebirth", editeur: "Square Enix", annee: 2024, plateformes: ["PS5", "PC"], genres: ["rpg", "action"], pegi: 16, note: 17, multijoueur: false, prix: 69.99 },
    { titre: "Cyberpunk 2077", editeur: "CD Projekt", annee: 2020, plateformes: ["PC", "PS5", "Xbox Series"], genres: ["rpg", "fps"], pegi: 18, note: 16, multijoueur: false, prix: 39.99 },
    { titre: "Starfield", editeur: "Bethesda", annee: 2023, plateformes: ["PC", "Xbox Series"], genres: ["rpg", "aventure"], pegi: 16, note: 14, multijoueur: false, prix: 69.99 },
    { titre: "God of War Ragnarök", editeur: "Sony Interactive Entertainment", annee: 2022, plateformes: ["PS5", "PS4", "PC"], genres: ["action", "aventure"], pegi: 18, note: 18, multijoueur: false, prix: 69.99 },
    { titre: "Red Dead Redemption 2", editeur: "Rockstar Games", annee: 2018, plateformes: ["PC", "PS4"], genres: ["action", "aventure"], pegi: 18, note: 19, multijoueur: true, prix: 59.99 },
    { titre: "Super Mario Bros. Wonder", editeur: "Nintendo", annee: 2023, plateformes: ["Switch"], genres: ["plateforme"], pegi: 3, note: 18, multijoueur: true, prix: 59.99 },
    { titre: "Hollow Knight", editeur: "Team Cherry", annee: 2017, plateformes: ["PC", "PS4", "Switch"], genres: ["plateforme", "action"], pegi: 7, note: 18, multijoueur: false, prix: 14.99 },
    { titre: "Celeste", editeur: "Maddy Makes Games", annee: 2018, plateformes: ["PC", "PS4", "Switch"], genres: ["plateforme", "puzzle"], pegi: 7, note: 17, multijoueur: false, prix: 19.99 },
    { titre: "Call of Duty: Modern Warfare III", editeur: "Activision", annee: 2023, plateformes: ["PC", "PS5", "PS4", "Xbox Series"], genres: ["fps", "action"], pegi: 18, note: 12, multijoueur: true, prix: 69.99 },
    { titre: "Counter-Strike 2", editeur: "Valve", annee: 2023, plateformes: ["PC"], genres: ["fps"], pegi: 18, note: 15, multijoueur: true, prix: 0 },
    { titre: "Doom Eternal", editeur: "Bethesda", annee: 2020, plateformes: ["PC", "PS4", "Xbox Series", "Switch"], genres: ["fps", "action"], pegi: 18, note: 17, multijoueur: true, prix: 39.99 },
    { titre: "EA Sports FC 25", editeur: "Electronic Arts", annee: 2024, plateformes: ["PC", "PS5", "PS4", "Xbox Series", "Switch"], genres: ["sport", "simulation"], pegi: 3, note: 13, multijoueur: true, prix: 69.99 },
    { titre: "NBA 2K25", editeur: "2K", annee: 2024, plateformes: ["PC", "PS5", "Xbox Series", "Switch"], genres: ["sport"], pegi: 3, note: 12, multijoueur: true, prix: 69.99 },
    { titre: "Mario Kart 8 Deluxe", editeur: "Nintendo", annee: 2017, plateformes: ["Switch"], genres: ["course"], pegi: 3, note: 18, multijoueur: true, prix: 59.99 },
    { titre: "Forza Horizon 5", editeur: "Xbox Game Studios", annee: 2021, plateformes: ["PC", "Xbox Series", "PS5"], genres: ["course", "simulation"], pegi: 3, note: 18, multijoueur: true, prix: 59.99 },
    { titre: "Gran Turismo 7", editeur: "Sony Interactive Entertainment", annee: 2022, plateformes: ["PS5", "PS4"], genres: ["course", "simulation"], pegi: 3, note: 17, multijoueur: true, prix: 69.99 },
    { titre: "Civilization VI", editeur: "2K", annee: 2016, plateformes: ["PC", "PS4", "Switch", "Mobile"], genres: ["strategie"], pegi: 12, note: 17, multijoueur: true, prix: 29.99 },
    { titre: "Age of Empires IV", editeur: "Xbox Game Studios", annee: 2021, plateformes: ["PC", "Xbox Series"], genres: ["strategie"], pegi: 12, note: 16, multijoueur: true, prix: 39.99 },
    { titre: "Les Sims 4", editeur: "Electronic Arts", annee: 2014, plateformes: ["PC", "PS4", "Xbox Series"], genres: ["simulation"], pegi: 12, note: 14, multijoueur: false, prix: 0 },
    { titre: "Stardew Valley", editeur: "ConcernedApe", annee: 2016, plateformes: ["PC", "PS4", "Switch", "Mobile"], genres: ["simulation"], pegi: 7, note: 18, multijoueur: true, prix: 13.99 },
    { titre: "Street Fighter 6", editeur: "Capcom", annee: 2023, plateformes: ["PC", "PS5", "PS4", "Xbox Series"], genres: ["combat"], pegi: 12, note: 18, multijoueur: true, prix: 59.99 },
    { titre: "Tekken 8", editeur: "Bandai Namco", annee: 2024, plateformes: ["PC", "PS5", "Xbox Series"], genres: ["combat"], pegi: 16, note: 17, multijoueur: true, prix: 69.99 },
    { titre: "Resident Evil 4", editeur: "Capcom", annee: 2023, plateformes: ["PC", "PS5", "PS4", "Xbox Series"], genres: ["horreur", "action"], pegi: 18, note: 18, multijoueur: false, prix: 39.99 },
    { titre: "Alan Wake 2", editeur: "Epic Games Publishing", annee: 2023, plateformes: ["PC", "PS5", "Xbox Series"], genres: ["horreur", "aventure"], pegi: 18, note: 17, multijoueur: false, prix: 49.99 },
    { titre: "Portal 2", editeur: "Valve", annee: 2011, plateformes: ["PC", "Switch"], genres: ["puzzle", "fps"], pegi: 12, note: 19, multijoueur: true, prix: 9.99 },
];

const seedJeux = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await Avis.deleteMany({});
    await Jeux.deleteMany({});
    await Jeux.syncIndexes();
    for (const jeu of jeux) {
        await Jeux.create(jeu);
    }
    console.log(`${jeux.length} jeux insérés`);
    await mongoose.disconnect();
};

if (require.main === module) {
    seedJeux().catch(async (err) => {
        console.error('Seed jeux échoué :', err.message);
        await mongoose.disconnect();
        process.exit(1);
    });
}

module.exports = { jeux, seedJeux };
