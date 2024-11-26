const express = require("express")
const flash = require("connect-flash")
const connectDB = require("./config/db")

const sessionMiddleware = require("./middleware/session")
const userStatusMiddleware = require("./middleware/userStatus")
const flashVariablesMiddleware = require("./middleware/flashVariables")
const { updateSessionUser } = require('./middleware/updateSession');
const errorHandler = require("./middleware/errorHandler")

const indexRouter = require("./routes/indexRouter")
const userRouter = require("./routes/userRouter")
const slangRouter = require("./routes/slangRouter")

connectDB();

const app = express();
app.set("views","./views")
app.set("view engine","ejs")

app.use(sessionMiddleware)
app.use(updateSessionUser)
app.use(flash())
app.use(userStatusMiddleware)
app.use(flashVariablesMiddleware)
app.use(express.urlencoded({extended:true}))
app.use("/",indexRouter)
app.use("/users",userRouter)
app.use("/slangs",slangRouter)
app.use(errorHandler.notFound)



app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000")
});
