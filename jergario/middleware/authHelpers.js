const MAX_USERNAME_LENGTH = 30;
const MIN_PASSWORD_LENGTH = 3;
const MAX_PASSWORD_LENGTH = 16;
const MAX_EMAIL_LENGTH = 100;
const User = require("../models/userModel");

const validateRegisterInput = ({ username, email, password, confirmPassword }, requirePassword = true) => {
    if (!username || !email) return 'Todos los campos son obligatorios';
    if (username.length > MAX_USERNAME_LENGTH) return `El nombre de usuario no debe exceder los ${MAX_USERNAME_LENGTH} caracteres`;
    if (email.length > MAX_EMAIL_LENGTH) return `El correo no debe exceder los ${MAX_EMAIL_LENGTH} caracteres`;

    if (requirePassword) {
        if (!password || !confirmPassword) return 'La contraseña y su confirmación son obligatorias';
        if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
            return `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`;
        }
        if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    }
    return null;
};

const flashAndRedirect = (req, res, type, message, redirectPath, sweetalert = false) => {
    req.flash('useSweetAlert', sweetalert);
    req.flash(type, message);
    return res.redirect(redirectPath);
};

const isNotLoggedIn = (req, res, next) => {
    if (!res.locals.isAuthenticated) {
        return flashAndRedirect(req, res, 'error', 'Debes iniciar sesión.', '/users/login', true);
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if (res.locals.isAuthenticated) {
        return flashAndRedirect(req, res, 'error', 'Ya has iniciado sesión', '/', true);
    }
    next();
};

const validateUniqueFields = async (username, email, userId) => {
    const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUsername) return 'El nombre de usuario ya está en uso';

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) return 'El correo electrónico ya está en uso';

    return null;
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    } else {
        return flashAndRedirect(req, res, 'error', 'No tienes permisos para esta vista.', '/users/profile', true);
    }
};

const handleUserNotFound = (req, res) => {
    if (!req.session) {
        return res.redirect('/users/login');
    }

    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/users/login');
        }
        res.redirect('/users/login');
    });
};



module.exports = {
    flashAndRedirect,
    isNotLoggedIn,
    isLoggedIn,
    validateUniqueFields,
    handleUserNotFound,
    validateRegisterInput,
    isAdmin
};
