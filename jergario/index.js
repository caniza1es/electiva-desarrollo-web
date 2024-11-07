const express = require("express")
const indexRouter = require("./routes/indexRouter")
const userRouter = require("./routes/userRouter")
const errorHandler = require("./middleware/errorHandler")
const session = require("express-session")
const flash = require("connect-flash")
const mongoose = require("mongoose")
const mongoStore = require("connect-mongo")
const mongoUrl = "mongodb://localhost:27017/miBaseDeDatos"

mongoose.connect(mongoUrl)
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));



const app = express()

app.set("views","./views")
app.set("view engine","ejs")

app.use(session({
    secret:"gato",
    resave:false,
    saveUninitialized:false,
    store:mongoStore.create({
        mongoUrl:mongoUrl
    })
}))

app.use(flash())
app.use(express.urlencoded({extended:true}))
app.use("/",indexRouter)
app.use("/users",userRouter)

app.use(errorHandler.notFound)
app.use(errorHandler.internalError)

app.listen(3000,()=>{
    console.log("Aplicacion corriendo en http://localhost:3000")
})