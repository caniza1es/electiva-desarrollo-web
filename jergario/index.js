const express = require("express")
const indexRouter = require("./routes/indexRouter")
const userRouter = require("./routes/userRouter")
const session = require("express-session")
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

app.use("/",indexRouter)
app.use("/users",userRouter)


app.use((err,req,res,next)=>{
    const status = err.status || 500
    res.status(status).render("error",{error:err})
})

app.use((req,res,next)=>{
    const status = 404
    const error = {
        status:status,
        message:"Vista no encontrada"
    }
    res.status(status).render("error",{error})
})

app.listen(3000,()=>{
    console.log("Aplicacion corriendo en http://localhost:3000")
})