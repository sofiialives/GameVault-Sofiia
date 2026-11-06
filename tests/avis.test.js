const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, connecter, deconnecter, creerCompte, jeuValide, Jeux } = require('./setup');

describe('Avis', () => {
    let jeu, ada, linus, admin, idAvis;

    before(async () => {
        await connecter('avis');
        jeu = await Jeux.create(jeuValide({ titre: 'Zelda test' }));
        ada = await creerCompte({ email: 'ada@test.fr', pseudo: 'Ada' });
        linus = await creerCompte({ email: 'linus@test.fr', pseudo: 'Linus' });
        admin = await creerCompte({ email: 'admin@test.fr', pseudo: 'Admin', role: 'admin' });
    });
    after(() => deconnecter());

    test('POST /jeux/:id/avis sans token → 401', async () => {
        const res = await request(app).post(`/api/v1/jeux/${jeu._id}/avis`).send({ note: 17 });
        assert.equal(res.status, 401);
    });

    test('POST /jeux/:id/avis → 201, l’auteur vient du token (pas du corps)', async () => {
        const res = await request(app).post(`/api/v1/jeux/${jeu._id}/avis`)
            .set('Authorization', `Bearer ${ada.token}`)
            .send({ note: 17, commentaire: 'Un monde immense, on s’y perd avec plaisir.', auteur: linus.user.id });
        assert.equal(res.status, 201);
        assert.equal(res.body.auteur, ada.user.id);
        assert.equal(res.body.jeu, jeu.id);
        idAvis = res.body._id;
    });

    test('POST deuxième avis du même joueur → 409', async () => {
        const res = await request(app).post(`/api/v1/jeux/${jeu._id}/avis`)
            .set('Authorization', `Bearer ${ada.token}`).send({ note: 10 });
        assert.equal(res.status, 409);
        assert.deepEqual(res.body, { erreur: 'Vous avez déjà donné votre avis sur ce jeu' });
    });

    test('POST avis sur un jeu absent → 404 "Jeu introuvable"', async () => {
        const res = await request(app).post('/api/v1/jeux/6751a2b3c4d5e6f708192a3b/avis')
            .set('Authorization', `Bearer ${ada.token}`).send({ note: 10 });
        assert.equal(res.status, 404);
        assert.deepEqual(res.body, { erreur: 'Jeu introuvable' });
    });

    test('POST avis note 25 ou commentaire > 500 caractères → 400', async () => {
        const r1 = await request(app).post(`/api/v1/jeux/${jeu._id}/avis`)
            .set('Authorization', `Bearer ${linus.token}`).send({ note: 25 });
        assert.equal(r1.status, 400);
        assert.deepEqual(r1.body.details, ['La note va de 0 à 20']);

        const r2 = await request(app).post(`/api/v1/jeux/${jeu._id}/avis`)
            .set('Authorization', `Bearer ${linus.token}`).send({ note: 10, commentaire: 'a'.repeat(501) });
        assert.equal(r2.status, 400);
    });

    test('POST avis id invalide → 400', async () => {
        const res = await request(app).post('/api/v1/jeux/abc/avis')
            .set('Authorization', `Bearer ${ada.token}`).send({ note: 10 });
        assert.equal(res.status, 400);
    });

    test('GET /jeux/:id/avis (public) → 200 avec le pseudo de l’auteur', async () => {
        const res = await request(app).get(`/api/v1/jeux/${jeu._id}/avis`);
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.equal(res.body[0].auteur.pseudo, 'Ada');
        assert.equal(res.body[0].auteur.email, undefined);
        assert.equal(res.body[0].auteur.password, undefined);
    });

    test('GET /jeux/:id/avis jeu absent → 404, id invalide → 400', async () => {
        const r404 = await request(app).get('/api/v1/jeux/6751a2b3c4d5e6f708192a3b/avis');
        assert.equal(r404.status, 404);
        const r400 = await request(app).get('/api/v1/jeux/abc/avis');
        assert.equal(r400.status, 400);
    });

    test('DELETE /avis/:id par un autre joueur → 403 "Ce n’est pas votre avis"', async () => {
        const res = await request(app).delete(`/api/v1/avis/${idAvis}`).set('Authorization', `Bearer ${linus.token}`);
        assert.equal(res.status, 403);
        assert.deepEqual(res.body, { erreur: 'Ce n’est pas votre avis' });
    });

    test('DELETE /avis/:id sans token → 401, id invalide → 400', async () => {
        const r401 = await request(app).delete(`/api/v1/avis/${idAvis}`);
        assert.equal(r401.status, 401);
        const r400 = await request(app).delete('/api/v1/avis/abc').set('Authorization', `Bearer ${ada.token}`);
        assert.equal(r400.status, 400);
    });

    test('DELETE /avis/:id par l’auteur → 204, puis 404', async () => {
        const res = await request(app).delete(`/api/v1/avis/${idAvis}`).set('Authorization', `Bearer ${ada.token}`);
        assert.equal(res.status, 204);
        const encore = await request(app).delete(`/api/v1/avis/${idAvis}`).set('Authorization', `Bearer ${ada.token}`);
        assert.equal(encore.status, 404);
    });

    test('DELETE /avis/:id par un admin → 204', async () => {
        const cree = await request(app).post(`/api/v1/jeux/${jeu._id}/avis`)
            .set('Authorization', `Bearer ${linus.token}`).send({ note: 14 });
        assert.equal(cree.status, 201);
        const res = await request(app).delete(`/api/v1/avis/${cree.body._id}`).set('Authorization', `Bearer ${admin.token}`);
        assert.equal(res.status, 204);
    });
});
