const session = require("express-session")
const mongoStore = require("connect-mongo")

const mongoUrl = "mongodb://localhost:27017/"

const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: "mycat",
    store: mongoStore.create({
        mongoUrl: mongoUrl,
    }),
});

module.exports = sessionMiddleware
