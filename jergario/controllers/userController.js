const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig');
const { 
    flashAndRedirect, 
    isNotLoggedIn, 
    isLoggedIn, 
    validateUniqueFields, 
    handleUserNotFound, 
    validateRegisterInput, 
    isAdmin 
} = require('../middleware/authHelpers');

const EMAIL_SECRET = 'epickey';

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({ to, subject, html });
};

const generateToken = (id, expiresIn = '1h') => jwt.sign({ id }, EMAIL_SECRET, { expiresIn });

const setSession = (req, user) => {
    req.session.userID = user._id;
    req.session.username = user.username;
    req.session.userRole = user.role;
};

exports.getRegister = [isLoggedIn, (req, res) => res.status(200).render("./users/register")];
exports.getLogin = [isLoggedIn, (req, res) => res.status(200).render("./users/login")];

exports.getProfile = [isNotLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.session.userID);
        if (!user) return handleUserNotFound(req, res);
        res.status(200).render('./users/profile', {
            username: user.username,
            totalUpvotes: user.totalUpvotes,
            totalDownvotes: user.totalDownvotes,
            isAdmin: req.session.userRole === 'admin'
        });
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error al cargar el perfil', '/');
    }
}];

exports.postLogout = [isNotLoggedIn, (req, res, next) => {
    req.session.destroy(err => {
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
        if (!user.isVerified) return flashAndRedirect(req, res, 'error', 'Por favor, verifica tu email para iniciar sesión.', '/users/login');
        setSession(req, user);
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
        const newUser = new User({ username, email, password, isVerified: false });
        await newUser.save();
        const token = generateToken(newUser._id);
        const verificationUrl = `${req.protocol}://${req.get('host')}/users/verify/${token}`;
        const emailHtml = `<p>Bienvenido, ${username}. Haz clic en el enlace para verificar tu email:</p><a href="${verificationUrl}">Verificar Email</a>`;
        await sendEmail(email, 'Verificación de Email - Jergar.io', emailHtml);
        return flashAndRedirect(req, res, 'success', 'Verifica tu email para activar tu cuenta.', '/users/login', true);
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Ocurrió un error, inténtalo de nuevo', '/users/register');
    }
}];

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, EMAIL_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return flashAndRedirect(req, res, 'error', 'Enlace de verificación inválido o expirado.', '/users/login');
        user.isVerified = true;
        await user.save();
        if (req.session && req.session.userID === user._id.toString()) {
            return flashAndRedirect(req, res, 'success', 'Email verificado exitosamente.', '/users/profile');
        } else if (req.session) {
            setSession(req, user);
            return flashAndRedirect(req, res, 'success', 'Email verificado. Has iniciado sesión automáticamente.', '/users/profile');
        } else {
            return flashAndRedirect(req, res, 'success', 'Email verificado. Ahora puedes iniciar sesión.', '/users/login');
        }
    } catch {
        return flashAndRedirect(req, res, 'error', 'Error en la verificación. Inténtalo de nuevo.', '/users/login');
    }
};

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
        if (user.password !== currentPassword) return flashAndRedirect(req, res, 'error', 'La contraseña actual es incorrecta', '/users/edit');
        const validationError = validateRegisterInput(
            { username, email, password: newPassword, confirmPassword: confirmNewPassword },
            !!newPassword
        );
        if (validationError) return flashAndRedirect(req, res, 'error', validationError, '/users/edit');
        const uniqueFieldError = await validateUniqueFields(username, email, user._id);
        if (uniqueFieldError) return flashAndRedirect(req, res, 'error', uniqueFieldError, '/users/edit');
        const emailChanged = user.email !== email;
        user.username = username || user.username;
        user.email = email || user.email;
        if (newPassword) user.password = newPassword;
        if (emailChanged) {
            user.isVerified = false;
            await user.save();
            const token = generateToken(user._id);
            const verificationUrl = `${req.protocol}://${req.get('host')}/users/verify/${token}`;
            const emailHtml = `<p>Hola, ${username}. Verifica tu nuevo correo electrónico:</p><a href="${verificationUrl}">Verificar Email</a>`;
            await sendEmail(email, 'Verificación de Nuevo Email - Jergar.io', emailHtml);
            return flashAndRedirect(req, res, 'success', 'Perfil actualizado. Revisa tu correo para verificar tu nuevo email.', '/users/profile');
        }
        await user.save();
        return flashAndRedirect(req, res, 'success', 'Perfil actualizado exitosamente', '/users/profile');
    } catch (error) {
        console.log(error.message);
        return flashAndRedirect(req, res, 'error', 'Error al actualizar el perfil', '/users/edit');
    }
}];

exports.getAdminPage = [isNotLoggedIn, isAdmin, async (req, res) => {
    const searchQuery = req.query.search || '';
    try {
        const users = await User.find({
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.status(200).render('./users/admin', { users, searchQuery });
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Error al cargar la página de administración', '/');
    }
}];

exports.deleteUser = [isNotLoggedIn, isAdmin, async (req, res) => {
    const { userId } = req.body;
    try {
        await User.findByIdAndDelete(userId);
        return flashAndRedirect(req, res, 'success', 'Usuario eliminado', '/users/admin');
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Error al eliminar el usuario', '/users/admin');
    }
}];

exports.getForgotPassword = [isLoggedIn, (req, res) => {
    res.status(200).render("./users/forgot-password");
}];

exports.postForgotPassword = [isLoggedIn, async (req, res) => {
    const { email } = req.body;
    if (!email) return flashAndRedirect(req, res, 'error', 'Por favor, introduce tu email.', '/users/forgot-password');
    try {
        const user = await User.findOne({ email });
        if (!user) return flashAndRedirect(req, res, 'error', 'No se encontró ninguna cuenta con ese email.', '/users/forgot-password');
        const token = generateToken(user._id);
        const resetUrl = `${req.protocol}://${req.get('host')}/users/reset-password/${token}`;
        const emailHtml = `<p>Hola, ${user.username}. Haz clic en el enlace para restablecer tu contraseña:</p><a href="${resetUrl}">Restablecer Contraseña</a>`;
        await sendEmail(email, 'Restablecimiento de Contraseña - Jergar.io', emailHtml);
        return flashAndRedirect(req, res, 'success', 'Se ha enviado un enlace de restablecimiento de contraseña a tu email.', '/users/login', true);
    } catch (error) {
        console.error(error);
        return flashAndRedirect(req, res, 'error', 'Error al enviar el enlace de restablecimiento de contraseña.', '/users/forgot-password');
    }
}];

exports.getResetPassword = [isLoggedIn, async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, EMAIL_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return flashAndRedirect(req, res, 'error', 'Enlace de restablecimiento inválido o expirado.', '/users/forgot-password');
        res.status(200).render('./users/reset-password', { token });
    } catch (error) {
        return flashAndRedirect(req, res, 'error', 'Enlace de restablecimiento inválido o expirado.', '/users/forgot-password');
    }
}];

exports.postResetPassword = [isLoggedIn, async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;
    if (!newPassword || !confirmNewPassword) return flashAndRedirect(req, res, 'error', 'Todos los campos son obligatorios.', `/users/reset-password/${token}`);
    if (newPassword !== confirmNewPassword) return flashAndRedirect(req, res, 'error', 'Las contraseñas no coinciden.', `/users/reset-password/${token}`);
    try {
        const decoded = jwt.verify(token, EMAIL_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return flashAndRedirect(req, res, 'error', 'Enlace de restablecimiento inválido o expirado.', '/users/forgot-password');
        user.password = newPassword;
        await user.save();
        return flashAndRedirect(req, res, 'success', 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.', '/users/login', true);
    } catch (error) {
        console.error(error);
        return flashAndRedirect(req, res, 'error', 'Error al restablecer la contraseña.', '/users/forgot-password');
    }
}];
