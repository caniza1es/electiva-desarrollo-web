const userStatusMiddleware = (req, res, next) => {
    if (req.session && req.session.userID) {
        res.locals.isAuthenticated = true
    } else {
        res.locals.isAuthenticated = false
    }
    next()
}

module.exports = userStatusMiddleware
