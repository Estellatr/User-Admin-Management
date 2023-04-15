const mongoose = require("mongoose");
const dev = require(".");

const connectDB = async () => {
    try {
        await mongoose.connect(dev.db.dbURL);
        console.log("Connected to database.")
    } catch (error) {
        console.log("Unable to connect to database", error);
    }
};

module.exports = connectDB;