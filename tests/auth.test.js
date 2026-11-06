const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { app, request, connecter, deconnecter, User } = require('./setup');

const compte = { email: 'Ada@Mail.fr', password: 'motdepasse123', pseudo: 'Ada' };

describe('Auth', () => {
    before(() => connecter('auth'));
    after(() => deconnecter());

    test('POST /auth/inscription → 201, rôle toujours "user", sans mot de passe', async () => {
        const res = await request(app).post('/api/v1/auth/inscription').send({ ...compte, role: 'admin' });
        assert.equal(res.status, 201);
        assert.equal(res.body.email, 'ada@mail.fr');
        assert.equal(res.body.role, 'user');
        assert.equal(res.body.password, undefined);

        const enBase = await User.findOne({ email: 'ada@mail.fr' });
        assert.notEqual(enBase.password, compte.password); // haché
    });

    test('POST /auth/inscription email déjà pris → 409', async () => {
        const res = await request(app).post('/api/v1/auth/inscription').send(compte);
        assert.equal(res.status, 409);
        assert.ok(res.body.erreur);
    });

    test('POST /auth/inscription données invalides → 400 avec details', async () => {
        const res = await request(app).post('/api/v1/auth/inscription').send({ email: 'pas-un-email', password: '123', pseudo: '' });
        assert.equal(res.status, 400);
        assert.equal(res.body.erreur, 'Données invalides');
        assert.ok(Array.isArray(res.body.details));
        assert.ok(res.body.details.length >= 2);
    });

    let token;
    test('POST /auth/connexion → 200, le token contient id et rôle', async () => {
        const res = await request(app).post('/api/v1/auth/connexion').send({ email: compte.email, password: compte.password });
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
        assert.ok(res.body.refreshToken);
        const payload = jwt.decode(res.body.token);
        assert.ok(payload.id);
        assert.equal(payload.role, 'user');
        token = res.body.token;
    });

    test('POST /auth/connexion mauvais mot de passe → 401', async () => {
        const res = await request(app).post('/api/v1/auth/connexion').send({ email: compte.email, password: 'mauvaismdp' });
        assert.equal(res.status, 401);
        assert.ok(res.body.erreur);
    });

    test('POST /auth/connexion corps vide → 400', async () => {
        const res = await request(app).post('/api/v1/auth/connexion').send({});
        assert.equal(res.status, 400);
    });

    test('GET /auth/moi avec token → 200 sans mot de passe', async () => {
        const res = await request(app).get('/api/v1/auth/moi').set('Authorization', `Bearer ${token}`);
        assert.equal(res.status, 200);
        assert.equal(res.body.pseudo, 'Ada');
        assert.equal(res.body.password, undefined);
    });

    test('GET /auth/moi sans token → 401 "Connexion requise"', async () => {
        const res = await request(app).get('/api/v1/auth/moi');
        assert.equal(res.status, 401);
        assert.equal(res.body.erreur, 'Connexion requise');
    });

    test('GET /auth/moi token invalide → 401', async () => {
        const res = await request(app).get('/api/v1/auth/moi').set('Authorization', 'Bearer abc.def.ghi');
        assert.equal(res.status, 401);
    });

    test('POST /auth/rafraichir puis /auth/deconnexion (bonus)', async () => {
        const connexion = await request(app).post('/api/v1/auth/connexion').send({ email: compte.email, password: compte.password });
        const r1 = await request(app).post('/api/v1/auth/rafraichir').send({ refreshToken: connexion.body.refreshToken });
        assert.equal(r1.status, 200);
        assert.ok(r1.body.token);

        const out = await request(app).post('/api/v1/auth/deconnexion').set('Authorization', `Bearer ${r1.body.token}`);
        assert.equal(out.status, 204);

        const r2 = await request(app).post('/api/v1/auth/rafraichir').send({ refreshToken: r1.body.refreshToken });
        assert.equal(r2.status, 401);
    });

    test('Trop d’échecs de connexion → 429', async () => {
        let dernier;
        for (let i = 0; i < 6; i++) {
            dernier = await request(app).post('/api/v1/auth/connexion').send({ email: compte.email, password: 'mauvais' + i });
        }
        assert.equal(dernier.status, 429);
        assert.ok(dernier.body.erreur);
    });

    test('Route inconnue → 404 "Route introuvable"', async () => {
        const res = await request(app).get('/api/v1/consoles');
        assert.equal(res.status, 404);
        assert.deepEqual(res.body, { erreur: 'Route introuvable' });
    });
});
