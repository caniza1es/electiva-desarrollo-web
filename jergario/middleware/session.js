const session = require("express-session")
const mongoStore = require("connect-mongo")

const mongoUrl = "mongodb+srv://canizalesbeltran:aqKKHGilVlSq4EO7@jergariocluster.2bb9m.mongodb.net/?retryWrites=true&w=majority&appName=jergarioCluster"

const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: "mycat",
    store: mongoStore.create({
        mongoUrl: mongoUrl,
    }),
});

module.exports = sessionMiddleware
