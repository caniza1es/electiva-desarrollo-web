const mongoose = require("mongoose")

const slangSchema = new mongoose.Schema({
    slang: {
        type: String,
        required: true
    },
    definition: {
        type: String,
        required: true
    },
    example: {
        type: String,
        required: true
    },
    byUser: {
        type: String,
        required: true
    },
    region: {
        type: String,
        enum: [
            "general", "España", "México", "Argentina", "Colombia", "Chile", 
            "Perú", "Venezuela", "Ecuador", "Guatemala", "Cuba", "Bolivia", 
            "Honduras", "Paraguay", "El Salvador", "Nicaragua", "Costa Rica", 
            "Puerto Rico", "Panamá", "Uruguay", "República Dominicana"
        ],
        required: true
    },
    datetime: {
        type: Date,
        default: Date.now
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    voters: [{ userId: String, voteType: String }]
});

module.exports = mongoose.model("Slang", slangSchema)
