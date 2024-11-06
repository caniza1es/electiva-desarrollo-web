const express = require("express")
const indexRouter = require("./routes/indexRouter")

const app = express()

app.set("views","./views")
app.set("view engine","ejs")
app.use("/",indexRouter)

app.listen(3000,()=>{
    console.log("Aplicacion corriendo en http://localhost:3000")
})

