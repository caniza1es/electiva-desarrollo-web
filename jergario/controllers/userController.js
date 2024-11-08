const User = require("../models/userModel")

const MAX_USERNAME_LENGTH = 30
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 100
const MAX_EMAIL_LENGTH = 100

exports.getRegister = (req, res, next) => {
    if (req.session && req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'Ya has iniciado sesión')
        return res.redirect('/')
    }
    res.status(200).render("./users/register")
}

exports.getLogin = (req, res, next) => {
    if (req.session && req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'Ya has iniciado sesión')
        return res.redirect('/')
    }
    res.status(200).render("./users/login")
}

exports.getProfile = (req, res, next) => {
    if (!req.session || !req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'Debes iniciar sesión para acceder a tu perfil')
        return res.redirect('/users/login')
    }

    res.status(200).render('./users/profile', {
        username: req.session.username 
    })
}

exports.postLogout = (req, res, next) => {
    if (!req.session || !req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'No has iniciado sesión')
        return res.redirect('/users/login')
    }

    req.session.destroy((err) => {
        if (err) {
            req.flash('error', 'Hubo un problema al cerrar la sesión Inténtalo de nuevo')
            return next(err)
        }
        res.redirect('/users/login')
    })
}

exports.postLogin = async (req, res, next) => {
    if (req.session && req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'Ya has iniciado sesión')
        return res.redirect('/')
    }

    const { username, password } = req.body

    if (!username || !password) {
        req.flash('error', 'Todos los campos son obligatorios')
        return res.redirect('/users/login')
    }

    try {
        const user = await User.findOne({ username: username })

        if (!user || user.password !== password) {
            req.flash('error', 'Nombre de usuario o contraseña incorrectos')
            return res.redirect('/users/login')
        }

        req.session.userID = user._id
        req.session.username = user.username 
        req.flash('useSweetAlert', true)
        req.flash('success', 'Inicio de sesión exitoso')
        res.redirect('/')
    } catch (err) {
        req.flash('error', 'Ocurrió un error al intentar iniciar sesión Inténtalo de nuevo')
        res.redirect('/users/login')
    }
}

exports.postRegister = async (req, res, next) => {
    if (req.session && req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'Ya has iniciado sesión')
        return res.redirect('/')
    }

    const { username, email, password, confirmPassword } = req.body

    if (!username || !email || !password || !confirmPassword) {
        req.flash('error', 'Todos los campos son obligatorios')
        return res.redirect('/users/register')
    }

    if (username.length > MAX_USERNAME_LENGTH) {
        req.flash('error', `El nombre de usuario no debe exceder los ${MAX_USERNAME_LENGTH} caracteres`)
        return res.redirect('/users/register')
    }
    if (email.length > MAX_EMAIL_LENGTH) {
        req.flash('error', `El correo no debe exceder los ${MAX_EMAIL_LENGTH} caracteres`)
        return res.redirect('/users/register')
    }
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        req.flash('error', `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`)
        return res.redirect('/users/register')
    }
    if (password !== confirmPassword) {
        req.flash('error', 'Las contraseñas no coinciden')
        return res.redirect('/users/register')
    }

    try {
        const existingEmail = await User.findOne({ email: email })
        if (existingEmail) {
            req.flash('error', 'El correo ya está en uso')
            return res.redirect('/users/register')
        }

        const existingUsername = await User.findOne({ username: username })
        if (existingUsername) {
            req.flash('error', 'El nombre de usuario ya está en uso')
            return res.redirect('/users/register')
        }

        const newUser = new User({ username, email, password })
        await newUser.save()
        req.flash('useSweetAlert', true)
        req.flash('success', 'Registro exitoso Ahora puedes iniciar sesión')
        res.redirect('/users/login')
    } catch (err) {
        req.flash('error', 'Ocurrió un error al intentar registrar Inténtalo de nuevo')
        res.redirect('/users/register')
    }
}
