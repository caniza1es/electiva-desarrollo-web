const User = require("../models/userModel")
const { flashAndRedirect, isNotLoggedIn, isLoggedIn } = require('../middleware/authHelpers')

const MAX_USERNAME_LENGTH = 30
const MIN_PASSWORD_LENGTH = 4
const MAX_PASSWORD_LENGTH = 16
const MAX_EMAIL_LENGTH = 100



const validateRegisterInput = ({ username, email, password, confirmPassword }) => {
    if (!username || !email || !password || !confirmPassword) return 'Todos los campos son obligatorios'
    if (username.length > MAX_USERNAME_LENGTH) return `El nombre de usuario no debe exceder los ${MAX_USERNAME_LENGTH} caracteres`
    if (email.length > MAX_EMAIL_LENGTH) return `El correo no debe exceder los ${MAX_EMAIL_LENGTH} caracteres`
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) return `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`;
    if (password !== confirmPassword) return 'Las contraseñas no coinciden'
    return null;
};

exports.getRegister = [isLoggedIn, (req, res) => res.status(200).render("./users/register")];
exports.getLogin = [isLoggedIn, (req, res) => res.status(200).render("./users/login")];
exports.getProfile = [isNotLoggedIn, (req, res) => res.status(200).render('./users/profile', { username: req.session.username })];

exports.postLogout = [isNotLoggedIn, (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(flashAndRedirect(req, res, 'error', 'Error al cerrar sesión, inténtalo de nuevo', '/'));
        res.redirect('/users/login');
    });
}];

exports.postLogin = [isLoggedIn, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return flashAndRedirect(req, res, 'error', 'Todos los campos son obligatorios', '/users/login');

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) return flashAndRedirect(req, res, 'error', 'Nombre de usuario o contraseña incorrectos', '/users/login');

        req.session.userID = user._id;
        req.session.username = user.username;
        return flashAndRedirect(req, res, 'success', 'Inicio de sesión exitoso', '/',true);
    } catch {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error, inténtalo de nuevo', '/users/login');
    }
}];

exports.postRegister = [isLoggedIn, async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const validationError = validateRegisterInput({ username, email, password, confirmPassword });
    if (validationError) return flashAndRedirect(req, res, 'error', validationError, '/users/register');

    try {
        if (await User.findOne({ email })) return flashAndRedirect(req, res, 'error', 'El correo ya está en uso', '/users/register');
        if (await User.findOne({ username })) return flashAndRedirect(req, res, 'error', 'El nombre de usuario ya está en uso', '/users/register');

        const newUser = new User({ username, email, password });
        await newUser.save();
        return flashAndRedirect(req, res, 'success', 'Registro exitoso, ahora puedes iniciar sesión', '/users/login',true);
    } catch {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error, inténtalo de nuevo', '/users/register');
    }
}];
