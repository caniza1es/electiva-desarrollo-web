exports.getLogin = (req,res,next)=>{
    const {error} = req.query
    res.status(200).render("./users/login",{error})
}

exports.getRegister = (req,res,next)=>{
    const {error} = req.query
    res.status(200).render("./users/register",{error})
}