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

        await newSlang.save()
        req.flash('useSweetAlert',true)
        req.flash('success', 'Jerga agregada exitosamente.')
        res.redirect('/')
    } catch (err) {
        req.flash('error', 'Ocurrió un error al intentar agregar la jerga. Inténtalo de nuevo.')
        res.redirect('/slangs/add')
    }
};

exports.upvoteSlang = async (req, res, next) => {
    if (!req.session || !req.session.userID) {
        req.flash('useSweetAlert', true)
        req.flash('error', 'Debes iniciar sesión para votar.')
        return res.redirect(req.get('referer') || '/')
    }

    const userId = req.session.userID
    const slangId = req.params.id

    try {
        const slang = await Slang.findById(slangId)

        const existingVoteIndex = slang.voters.findIndex(voter => voter.userId === userId)

        if (existingVoteIndex === -1) {
            slang.voters.push({ userId: userId, voteType: "upvote" })
            slang.upvotes += 1
        } else {
            const existingVote = slang.voters[existingVoteIndex];

            if (existingVote.voteType === "upvote") {
                slang.voters.splice(existingVoteIndex, 1)
                slang.upvotes -= 1;
            } else if (existingVote.voteType === "downvote") {
                slang.voters[existingVoteIndex].voteType = "upvote"
                slang.upvotes += 1
                slang.downvotes -= 1
            }
        }

        await slang.save();
        res.redirect(req.get('referer') || '/')
    } catch (error) {
        next(error)
    }
}


exports.downvoteSlang = async (req, res, next) => {
    if (!req.session || !req.session.userID) {
        req.flash('useSweetAlert', true);
        req.flash('error', 'Debes iniciar sesión para votar.')
        return res.redirect(req.get('referer') || '/')
    }

    const userId = req.session.userID
    const slangId = req.params.id

    try {
        const slang = await Slang.findById(slangId)

        const existingVoteIndex = slang.voters.findIndex(voter => voter.userId === userId)

        if (existingVoteIndex === -1) {
            slang.voters.push({ userId: userId, voteType: "downvote" });
            slang.downvotes += 1
        } else {
            const existingVote = slang.voters[existingVoteIndex]

            if (existingVote.voteType === "downvote") {
                slang.voters.splice(existingVoteIndex, 1)
                slang.downvotes -= 1
            } else if (existingVote.voteType === "upvote") {
                slang.voters[existingVoteIndex].voteType = "downvote"
                slang.downvotes += 1
                slang.upvotes -= 1
            }
        }

        await slang.save()
        res.redirect(req.get('referer') || '/')
    } catch (error) {
        next(error)
    }
}