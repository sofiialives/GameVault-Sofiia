const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, connecter, deconnecter, creerCompte, jeuValide, Jeux, Avis } = require('./setup');
const { jeux: jeuxSeed } = require('../config/seed-jeux');

describe('Jeux', () => {
    let tokenAdmin, tokenUser;

    before(async () => {
        await connecter('jeux');
        for (const jeu of jeuxSeed) await Jeux.create(jeu);
        ({ token: tokenAdmin } = await creerCompte({ email: 'admin@test.fr', role: 'admin' }));
        ({ token: tokenUser } = await creerCompte({ email: 'user@test.fr' }));
    });
    after(() => deconnecter());

    test('GET /jeux → 200, format { donnees, pagination }, 10 par défaut', async () => {
        const res = await request(app).get('/api/v1/jeux');
        assert.equal(res.status, 200);
        assert.equal(res.body.donnees.length, 10);
        assert.deepEqual(res.body.pagination, { page: 1, limite: 10, total: 30, pages: 3 });
    });

    test('GET /jeux trié par note décroissante par défaut', async () => {
        const res = await request(app).get('/api/v1/jeux?limite=50');
        const notes = res.body.donnees.map((j) => j.note);
        assert.deepEqual(notes, [...notes].sort((a, b) => b - a));
    });

    test('GET /jeux limite max 50', async () => {
        const res = await request(app).get('/api/v1/jeux?limite=500');
        assert.equal(res.body.pagination.limite, 50);
    });

    test('GET /jeux?genre=rpg&noteMin=17&page=1&limite=2 → exemple du sujet', async () => {
        const res = await request(app).get('/api/v1/jeux?genre=rpg&noteMin=17&page=1&limite=2');
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.donnees.map((j) => j.titre), ['Elden Ring', "Baldur's Gate 3"]);
        assert.deepEqual(res.body.pagination, { page: 1, limite: 2, total: 5, pages: 3 });
    });

    test('GET /jeux?page=2 renvoie d’autres jeux que la page 1', async () => {
        const p1 = await request(app).get('/api/v1/jeux?limite=5&page=1');
        const p2 = await request(app).get('/api/v1/jeux?limite=5&page=2');
        const ids1 = p1.body.donnees.map((j) => j._id);
        assert.ok(p2.body.donnees.every((j) => !ids1.includes(j._id)));
    });

    test('GET /jeux?recherche=ZELDA → insensible à la casse', async () => {
        const res = await request(app).get('/api/v1/jeux?recherche=ZELDA');
        assert.equal(res.body.donnees.length, 1);
        assert.match(res.body.donnees[0].titre, /Zelda/);
    });

    test('GET /jeux?recherche avec caractères spéciaux ne plante pas', async () => {
        const res = await request(app).get('/api/v1/jeux?recherche=' + encodeURIComponent('(['));
        assert.equal(res.status, 200);
        assert.equal(res.body.donnees.length, 0);
    });

    test('GET /jeux?plateforme=Switch', async () => {
        const res = await request(app).get('/api/v1/jeux?plateforme=Switch&limite=50');
        assert.ok(res.body.donnees.length > 0);
        assert.ok(res.body.donnees.every((j) => j.plateformes.includes('Switch')));
    });

    test('GET /jeux?pegiMax=12', async () => {
        const res = await request(app).get('/api/v1/jeux?pegiMax=12&limite=50');
        assert.ok(res.body.donnees.length > 0);
        assert.ok(res.body.donnees.every((j) => j.pegi <= 12));
    });

    test('GET /jeux?tri=prix&ordre=asc', async () => {
        const res = await request(app).get('/api/v1/jeux?tri=prix&ordre=asc&limite=50');
        const prix = res.body.donnees.map((j) => j.prix);
        assert.deepEqual(prix, [...prix].sort((a, b) => a - b));
        assert.equal(prix[0], 0);
    });

    test('GET /jeux/:id → 200', async () => {
        const jeu = await Jeux.findOne({ titre: 'Elden Ring' });
        const res = await request(app).get(`/api/v1/jeux/${jeu._id}`);
        assert.equal(res.status, 200);
        assert.equal(res.body.titre, 'Elden Ring');
    });

    test('GET /jeux/abc → 400 "Identifiant invalide"', async () => {
        const res = await request(app).get('/api/v1/jeux/abc');
        assert.equal(res.status, 400);
        assert.deepEqual(res.body, { erreur: 'Identifiant invalide' });
    });

    test('GET /jeux/:id inexistant → 404 "Jeu introuvable"', async () => {
        const res = await request(app).get('/api/v1/jeux/6751a2b3c4d5e6f708192a3b');
        assert.equal(res.status, 404);
        assert.deepEqual(res.body, { erreur: 'Jeu introuvable' });
    });

    test('POST /jeux sans token → 401 "Connexion requise"', async () => {
        const res = await request(app).post('/api/v1/jeux').send(jeuValide());
        assert.equal(res.status, 401);
        assert.deepEqual(res.body, { erreur: 'Connexion requise' });
    });

    test('POST /jeux token user → 403 "Réservé aux administrateurs"', async () => {
        const res = await request(app).post('/api/v1/jeux').set('Authorization', `Bearer ${tokenUser}`).send(jeuValide());
        assert.equal(res.status, 403);
        assert.deepEqual(res.body, { erreur: 'Réservé aux administrateurs' });
    });

    test('POST /jeux note 25 → 400 avec "La note va de 0 à 20"', async () => {
        const res = await request(app).post('/api/v1/jeux').set('Authorization', `Bearer ${tokenAdmin}`).send(jeuValide({ note: 25 }));
        assert.equal(res.status, 400);
        assert.deepEqual(res.body, { erreur: 'Données invalides', details: ['La note va de 0 à 20'] });
    });

    test('POST /jeux plateforme ou pegi invalides → 400', async () => {
        const res = await request(app).post('/api/v1/jeux').set('Authorization', `Bearer ${tokenAdmin}`)
            .send(jeuValide({ plateformes: ['Dreamcast'], pegi: 10, annee: 1960 }));
        assert.equal(res.status, 400);
        assert.equal(res.body.details.length, 3);
    });

    let idCree;
    test('POST /jeux admin → 201, multijoueur false par défaut, titre "trim"', async () => {
        const { multijoueur, ...sansMulti } = jeuValide({ titre: '  Nouveau Jeu  ' });
        const res = await request(app).post('/api/v1/jeux').set('Authorization', `Bearer ${tokenAdmin}`).send(sansMulti);
        assert.equal(res.status, 201);
        assert.equal(res.body.titre, 'Nouveau Jeu');
        assert.equal(res.body.multijoueur, false);
        assert.ok(res.body.createdAt);
        idCree = res.body._id;
    });

    test('POST /jeux titre déjà pris → 409 "Ce titre existe déjà"', async () => {
        const res = await request(app).post('/api/v1/jeux').set('Authorization', `Bearer ${tokenAdmin}`).send(jeuValide({ titre: 'Elden Ring' }));
        assert.equal(res.status, 409);
        assert.deepEqual(res.body, { erreur: 'Ce titre existe déjà' });
    });

    test('PUT /jeux/:id admin → 200', async () => {
        const res = await request(app).put(`/api/v1/jeux/${idCree}`).set('Authorization', `Bearer ${tokenAdmin}`).send({ prix: 9.99 });
        assert.equal(res.status, 200);
        assert.equal(res.body.prix, 9.99);
    });

    test('PUT /jeux/:id corps vide → 400', async () => {
        const res = await request(app).put(`/api/v1/jeux/${idCree}`).set('Authorization', `Bearer ${tokenAdmin}`).send({});
        assert.equal(res.status, 400);
    });

    test('PUT /jeux/:id titre d’un autre jeu → 409', async () => {
        const res = await request(app).put(`/api/v1/jeux/${idCree}`).set('Authorization', `Bearer ${tokenAdmin}`).send({ titre: 'Elden Ring' });
        assert.equal(res.status, 409);
    });

    test('PUT /jeux/:id inexistant → 404, token user → 403', async () => {
        const r404 = await request(app).put('/api/v1/jeux/6751a2b3c4d5e6f708192a3b').set('Authorization', `Bearer ${tokenAdmin}`).send({ prix: 1 });
        assert.equal(r404.status, 404);
        const r403 = await request(app).put(`/api/v1/jeux/${idCree}`).set('Authorization', `Bearer ${tokenUser}`).send({ prix: 1 });
        assert.equal(r403.status, 403);
    });

    test('DELETE /jeux/:id → 204 et supprime ses avis', async () => {
        const auteur = (await creerCompte({ email: 'fan@test.fr' })).user;
        await Avis.create({ jeu: idCree, auteur: auteur._id, note: 12 });

        const res = await request(app).delete(`/api/v1/jeux/${idCree}`).set('Authorization', `Bearer ${tokenAdmin}`);
        assert.equal(res.status, 204);
        assert.equal(await Jeux.findById(idCree), null);
        assert.equal(await Avis.countDocuments({ jeu: idCree }), 0);
    });

    test('DELETE /jeux/:id déjà supprimé → 404, id invalide → 400', async () => {
        const r404 = await request(app).delete(`/api/v1/jeux/${idCree}`).set('Authorization', `Bearer ${tokenAdmin}`);
        assert.equal(r404.status, 404);
        const r400 = await request(app).delete('/api/v1/jeux/abc').set('Authorization', `Bearer ${tokenAdmin}`);
        assert.equal(r400.status, 400);
    });
});
