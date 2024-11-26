const mongoose = require("mongoose")
const mongoUrl = "mongodb+srv://canizalesbeltran:aqKKHGilVlSq4EO7@jergariocluster.2bb9m.mongodb.net/?retryWrites=true&w=majority&appName=jergarioCluster"

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl)
        console.log("Conneccion exitosa")
    } catch (err) {
        console.error("Conneccion fallida")
        process.exit(1)
    }
};

module.exports = connectDB
