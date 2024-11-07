exports.notFound = (req,res,next)=>{
    req.flash("error","Error 404: Vista no encontrada")
    res.redirect("/error")
}

exports.internalError = (error,req,res,next)=>{
    const status = error.status || 500
    req.flash("error",error.message)
    res.redirect("/error")
}