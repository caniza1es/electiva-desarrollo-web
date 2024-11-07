const User = require("../models/userModel")


exports.getLogin = (req,res,next)=>{
    const error = req.flash("error")[0]
    const success = req.flash("success")[0]
    res.status(200).render("./users/login",{error,success})
}

exports.getRegister = (req,res,next)=>{
    const error = req.flash("error")[0]
    res.status(200).render("./users/register",{error})
}

exports.postLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username })
        if (!user || user.password !== password) {
            req.flash("error", "Usuario o contraseña incorrectos")
            return res.redirect("/users/login"); 
        }
        req.session.userID = user._id
        res.redirect("/")
    } catch (error) {
        next(error)
    }
};

exports.postRegister = async (req, res, next) => {
    try {
        const { username, email, password, confirm } = req.body
        const existingUser = await User.findOne({ 
            $or: [{ username: username }, { email: email }]
        })
        if (existingUser) {
            if (existingUser.username === username) {
                req.flash("error", "El nombre de usuario ya está en uso")
            } else if (existingUser.email === email) {
                req.flash("error", "El correo electrónico ya está en uso")
            }
            return res.redirect("/users/register")
        }
        if (password !== confirm) {
            req.flash("error", "Las contraseñas no coinciden")
            return res.redirect("/users/register");
        }
        await User.create({ username, email, password });
        req.flash("success", "Registro exitoso. Por favor, inicia sesión.")
        res.redirect("/users/login")
    } catch (error) {
        next(error)
    }
};
