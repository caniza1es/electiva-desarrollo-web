
const User = require('../models/userModel');

exports.updateSessionUser = async (req, res, next) => {
    if (req.session && req.session.userID) {
        try {
            const user = await User.findById(req.session.userID);
            if (user) {
   
                req.session.username = user.username;
                req.session.userRole = user.role;
   
            } else {
           
                req.session.destroy(err => {
                    if (err) console.error(err);
                    res.clearCookie('connect.sid');
                    return res.redirect('/users/login');
                });
                return; 
            }
        } catch (error) {
            console.error(error);
            return next(error);
        }
    }
    next();
};