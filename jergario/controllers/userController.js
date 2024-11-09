const User = require("../models/userModel")
const { flashAndRedirect, isNotLoggedIn, isLoggedIn,validateUniqueFields,handleUserNotFound,validateRegisterInput } = require('../middleware/authHelpers')

exports.getRegister = [isLoggedIn, (req, res) => res.status(200).render("./users/register")];
exports.getLogin = [isLoggedIn, (req, res) => res.status(200).render("./users/login")];

exports.getProfile = [isNotLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userID);
        if (!user) return handleUserNotFound(req, res);

        res.status(200).render('./users/profile', {
            username: user.username,
            totalUpvotes: user.totalUpvotes,
            totalDownvotes: user.totalDownvotes
        });
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error al cargar el perfil', '/');
    }
}];

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
        return flashAndRedirect(req, res, 'success', 'Inicio de sesión exitoso', '/', true);
    } catch {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error, inténtalo de nuevo', '/users/login');
    }
}];

exports.postRegister = [isLoggedIn, async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    const validationError = validateRegisterInput({ username, email, password, confirmPassword });
    if (validationError) return flashAndRedirect(req, res, 'error', validationError, '/users/register');

    try {
        const uniqueFieldError = await validateUniqueFields(username, email);
        if (uniqueFieldError) return flashAndRedirect(req, res, 'error', uniqueFieldError, '/users/register');

        const newUser = new User({ username, email, password });
        await newUser.save();
        return flashAndRedirect(req, res, 'success', 'Registro exitoso, ahora puedes iniciar sesión', '/users/login', true);
    } catch {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error, inténtalo de nuevo', '/users/register');
    }
}];

exports.getEditProfile = [isNotLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userID);
        if (!user) return handleUserNotFound(req, res);

        res.status(200).render('./users/edit', {
            username: user.username,
            email: user.email
        });
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error al cargar la página de edición de perfil', '/');
    }
}];

exports.postEditProfile = [isNotLoggedIn, async (req, res) => {
    const { username, email, currentPassword, newPassword, confirmNewPassword } = req.body;

    try {
        const user = await User.findById(req.session.userID);
        if (!user) return handleUserNotFound(req, res);

        if (user.password !== currentPassword) {
            return flashAndRedirect(req, res, 'error', 'La contraseña actual es incorrecta', '/users/edit');
        }

        const validationError = validateRegisterInput(
            { username, email, password: newPassword, confirmPassword: confirmNewPassword },
            !!newPassword
        );

        if (validationError) {
            return flashAndRedirect(req, res, 'error', validationError, '/users/edit');
        }

        const uniqueFieldError = await validateUniqueFields(username, email, user._id);
        if (uniqueFieldError) {
            return flashAndRedirect(req, res, 'error', uniqueFieldError, '/users/edit');
        }

        user.username = username || user.username;
        user.email = email || user.email;
        if (newPassword) user.password = newPassword;

        await user.save();
        return flashAndRedirect(req, res, 'success', 'Perfil actualizado exitosamente', '/users/profile');
    } catch (error) {
        console.log(error.message)
        return flashAndRedirect(req, res, 'error', 'Error al actualizar el perfil', '/users/edit');
    }
}];
