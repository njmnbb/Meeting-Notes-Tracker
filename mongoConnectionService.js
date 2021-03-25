const mongoose = require('mongoose');
const {mongoConnectionString, mongoDatabaseName} = require("./config.json");

module.exports.connect = function() {
    mongoose.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('connected to mongodb');
    });
}