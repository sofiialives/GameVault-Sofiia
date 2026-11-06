const User = require("../models/user.mongo");

class userService {
    constructor() { }

    async findByEmail(email) {
        if (!email) return null;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        return user;
    }

    async findById(id) {
        return User.findById(id).select("-password");
    }

    async newUser({ email, password, pseudo }) {
        return User.create({ email, password, pseudo, role: "user" });
    }

    async findUserAndUpdate(id, updates) {
        return User.findByIdAndUpdate(id, updates, { returnDocument: "after" });
    }

    async findByRefreshToken(refreshToken) {
        return User.findOne({ refreshToken });
    }
}

module.exports = new userService();
