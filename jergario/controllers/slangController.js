const Slang = require("../models/slangModel");
const User = require("../models/userModel")
const { flashAndRedirect, isNotLoggedIn } = require('../middleware/authHelpers')

const MAX_SLANG_LENGTH = 25;
const MAX_DEFINITION_LENGTH = 250;
const MAX_EXAMPLE_LENGTH = 150;


const validateSlangInput = ({ slang, definition, example, region }) => {
    if (!slang || !definition || !example || !region) return 'Todos los campos son obligatorios.';
    if (slang.length > MAX_SLANG_LENGTH) return `La jerga no debe exceder los ${MAX_SLANG_LENGTH} caracteres.`;
    if (definition.length > MAX_DEFINITION_LENGTH) return `La definición no debe exceder los ${MAX_DEFINITION_LENGTH} caracteres.`;
    if (example.length > MAX_EXAMPLE_LENGTH) return `El ejemplo no debe exceder los ${MAX_EXAMPLE_LENGTH} caracteres.`;
    return null;
};

exports.getAddSlang = [isNotLoggedIn, (req, res) => {
    res.status(200).render('slangs/add', { isAuthenticated: true });
}];

exports.postAddSlang = [isNotLoggedIn, async (req, res) => {
    const { slang, definition, example, region } = req.body;
    const validationError = validateSlangInput({ slang, definition, example, region });
    if (validationError) return flashAndRedirect(req, res, 'error', validationError, '/slangs/add');

    try {
        const newSlang = new Slang({
            slang: slang.trim(),
            definition: definition.trim(),
            example: example.trim(),
            region,
            byUser: req.session.username
        });

        await newSlang.save();
        return flashAndRedirect(req, res, 'success', 'Jerga agregada exitosamente.', '/',true);
    } catch {
        return flashAndRedirect(req, res, 'error', 'Error al agregar la jerga. Inténtalo de nuevo.', '/slangs/add');
    }
}];

const handleVote = async (req, res, next, voteType) => {
    const userId = req.session.userID;
    const slangId = req.params.id;

    try {
        const slang = await Slang.findById(slangId);
        const existingVoteIndex = slang.voters.findIndex(voter => voter.userId === userId);
        const oppositeVoteType = voteType === "upvote" ? "downvote" : "upvote";

        if (existingVoteIndex === -1) {
            slang.voters.push({ userId, voteType });
            slang[voteType + "s"] += 1;
        } else {
            const existingVote = slang.voters[existingVoteIndex];
            if (existingVote.voteType === voteType) {
                slang.voters.splice(existingVoteIndex, 1);
                slang[voteType + "s"] -= 1;
            } else if (existingVote.voteType === oppositeVoteType) {
                slang.voters[existingVoteIndex].voteType = voteType;
                slang[voteType + "s"] += 1;
                slang[oppositeVoteType + "s"] -= 1;
            }
        }
        const user = await User.findOne({ username: slang.byUser });
        if (user) {
            if (voteType === "upvote") {
                user.totalUpvotes += 1;
                if (existingVoteIndex !== -1 && slang.voters[existingVoteIndex].voteType === oppositeVoteType) {
                    user.totalDownvotes -= 1;
                }
            } else {
                user.totalDownvotes += 1;
                if (existingVoteIndex !== -1 && slang.voters[existingVoteIndex].voteType === oppositeVoteType) {
                    user.totalUpvotes -= 1;
                }
            }
            await user.save();
        }

        await slang.save();
        res.redirect(req.get('referer') || '/');
    } catch (error) {
        next(error);
    }
};


exports.upvoteSlang = [isNotLoggedIn, (req, res, next) => handleVote(req, res, next, "upvote")];
exports.downvoteSlang = [isNotLoggedIn, (req, res, next) => handleVote(req, res, next, "downvote")];
