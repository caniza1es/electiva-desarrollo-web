const mongoose = require("mongoose");
const mongoUrl = "mongodb://localhost:27017/"

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl);
        console.log("Conneccion exitosa")
    } catch (err) {
        console.error("Conneccion fallida")
        process.exit(1)
    }
};

module.exports = connectDB;
