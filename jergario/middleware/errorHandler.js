exports.notFound = (req,res,next)=>{
    const error = {
        status:404,
        message:"Vista no encontrada"
    }
    const user = req.flash("user")[0]
    res.status(error.status).render("error",{user,error})
}

exports.internalError = (error,req,res,next)=>{
    error.status = error.status || 500
    const user = req.flash("user")[0]
    res.status(error.status).render("error",{user,error})
}

