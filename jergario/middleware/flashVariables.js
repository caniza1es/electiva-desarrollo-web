const flashVariablesMiddleware = (req, res, next) => {
    res.locals.error = req.flash('error') || []
    res.locals.success = req.flash('success') || []
    res.locals.useSweetAlert = req.flash('useSweetAlert').length > 0
    next();
};

module.exports = flashVariablesMiddleware
