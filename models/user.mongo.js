const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Veuillez entrer un email valide.'],
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire.'],
        minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères.'],
    },
    pseudo: {
        type: String,
        required: [true, 'Pseudo est obligatoire.'],
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    refreshToken: {
        type: String,
        default: null,
    }
}, { timestamps: true, versionKey: false });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);
