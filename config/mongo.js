const mongoose = require('mongoose');
const connectMongo = () => {
    return mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Je suis connecte a mongo') )
        .catch(err => {
            console.log('erreur ' + err.message)
            process.exit(1)
        })
}
module.exports = connectMongo;
