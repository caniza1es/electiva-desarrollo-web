const flashAndRedirect = (req, res, type, message, redirectPath, sweetalert=false) => {
    req.flash('useSweetAlert', sweetalert)
    req.flash(type, message)
    return res.redirect(redirectPath)
}

const isNotLoggedIn = (req, res, next) => {
    if (!res.locals.isAuthenticated) {
        return flashAndRedirect(req, res, 'error', 'Debes iniciar sesión.', '/users/login',true)
    }
    next()
}

const isLoggedIn = (req, res, next) => {
    if (res.locals.isAuthenticated) {
        return flashAndRedirect(req, res, 'error', 'Ya has iniciado sesión', '/',true)
    }
    next()
}

module.exports = {
    flashAndRedirect,
    isNotLoggedIn,
    isLoggedIn
}
