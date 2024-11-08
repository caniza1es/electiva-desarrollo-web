const Slang = require("../models/slangModel"); 

exports.getAddSlang = (req, res, next) => {
    if (!req.session || !req.session.userID) {
        req.flash('useSweetAlert',true)
        req.flash('error', 'Debes iniciar sesión para agregar una jerga.')
        return res.redirect('/users/login')
    }

    res.status(200).render('slangs/add', {
        isAuthenticated: true
    })
};


exports.postAddSlang = async (req, res, next) => {
    if (!req.session || !req.session.userID) {
        req.flash('useSweetAlert',true)
        req.flash('error', 'Debes iniciar sesión para agregar una jerga.')
        return res.redirect('/users/login')
    }

    const { slang, definition, example, region } = req.body

    if (!slang || !definition || !example || !region) {
        req.flash('error', 'Todos los campos son obligatorios.')
        return res.redirect('/slangs/add')
    }

    try {
        const newSlang = new Slang({
            slang,
            definition,
            example,
            region,
            byUser: req.session.username
        });

        await newSlang.save();
        req.flash('useSweetAlert',true)
        req.flash('success', 'Jerga agregada exitosamente.')
        res.redirect('/')
    } catch (err) {
        req.flash('error', 'Ocurrió un error al intentar agregar la jerga. Inténtalo de nuevo.')
        res.redirect('/slangs/add')
    }
};
