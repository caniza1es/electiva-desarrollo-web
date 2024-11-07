const express = require("express")
const indexRouter = require("./routes/indexRouter")
const userRouter = require("./routes/userRouter")

const app = express()

app.set("views","./views")
app.set("view engine","ejs")
app.use("/",indexRouter)
app.use("/users",userRouter)

app.listen(3000,()=>{
    console.log("Aplicacion corriendo en http://localhost:3000")
})

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