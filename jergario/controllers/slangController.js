const Slang = require("../models/slangModel");
const { flashAndRedirect } = require("../middleware/authHelpers");

const MAX_SLANG_LENGTH = 50;
const MAX_DEFINITION_LENGTH = 250;
const MAX_EXAMPLE_LENGTH = 150;

const validateSlangInput = ({ slang, definition, example, region }) => {
    if (!slang || !definition || !example || !region) return 'Todos los campos son obligatorios.';
    if (slang.length > MAX_SLANG_LENGTH) return `La jerga no debe exceder los ${MAX_SLANG_LENGTH} caracteres.`;
    if (definition.length > MAX_DEFINITION_LENGTH) return `La definición no debe exceder los ${MAX_DEFINITION_LENGTH} caracteres.`;
    if (example.length > MAX_EXAMPLE_LENGTH) return `El ejemplo no debe exceder los ${MAX_EXAMPLE_LENGTH} caracteres.`;
    return null;
};

exports.getAddSlang = (req, res) => {
    res.status(200).render("slangs/add", { isAuthenticated: true });
};

exports.postAddSlang = async (req, res) => {
    const { slang, definition, example, region } = req.body;
    const validationError = validateSlangInput({ slang, definition, example, region });
    if (validationError) return flashAndRedirect(req, res, "error", validationError, "/slangs/add");

    try {
        const newSlang = new Slang({
            slang: slang.trim(),
            definition: definition.trim(),
            example: example.trim(),
            region,
            byUser: req.session.username
        });
        await newSlang.save();
        return flashAndRedirect(req, res, "success", "Jerga agregada exitosamente.", "/dictionary", true);
    } catch (error) {
        return flashAndRedirect(req, res, "error", "Error al agregar la jerga. Inténtalo de nuevo.", "/slangs/add");
    }
};

const handleVote = async (req, res, next, voteType) => {
    const userId = req.session.userID;
    const slangId = req.params.id;

    try {
        const slang = await Slang.findById(slangId);
        const existingVoteIndex = slang.voters.findIndex(voter => voter.userId === userId);
        const oppositeVoteType = voteType === "upvote" ? "downvote" : "upvote";
        const isRemovingOppositeVote = existingVoteIndex !== -1 && slang.voters[existingVoteIndex].voteType === oppositeVoteType;

        if (existingVoteIndex === -1) {
            slang.voters.push({ userId, voteType });
            slang[voteType + "s"] += 1;
        } else {
            const existingVote = slang.voters[existingVoteIndex];
            if (existingVote.voteType === voteType) {
                slang.voters.splice(existingVoteIndex, 1);
                slang[voteType + "s"] -= 1;
            } else if (isRemovingOppositeVote) {
                slang.voters[existingVoteIndex].voteType = voteType;
                slang[voteType + "s"] += 1;
                slang[oppositeVoteType + "s"] -= 1;
            }
        }

        await slang.save();
        res.redirect(req.get("referer") || "/dictionary");
    } catch (error) {
        next(error);
    }
};

exports.upvoteSlang = (req, res, next) => handleVote(req, res, next, "upvote");

exports.downvoteSlang = (req, res, next) => handleVote(req, res, next, "downvote");

exports.deleteSlang = async (req, res) => {
    try {
        await Slang.findByIdAndDelete(req.params.id);
        flashAndRedirect(req, res, "success", "Jerga eliminada exitosamente.", "/dictionary");
    } catch (error) {
        flashAndRedirect(req, res, "error", "Error al eliminar la jerga.", "/dictionary");
    }
};
