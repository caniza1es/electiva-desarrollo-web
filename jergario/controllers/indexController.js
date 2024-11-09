const Slang = require("../models/slangModel");

exports.getIndex = async (req, res, next) => {
    try {
        const { searchText, author, region, page = 1 } = req.query;
        const limit = 3; 

        let filter = {};
        if (searchText) filter.slang = { $regex: searchText, $options: "i" };
        if (author) filter.byUser = author;
        if (region) filter.region = region;

        const totalResults = await Slang.countDocuments(filter);
        const totalPages = Math.ceil(totalResults / limit);
        const slangs = await Slang.find(filter)
            .sort({ upvotes: -1 }) 
            .limit(limit)
            .skip((page - 1) * limit);

        const isAdmin = req.session.userRole === 'admin'; 

        res.render("index", {
            slangs,
            searchText,
            author,
            region,
            currentPage: parseInt(page),
            totalPages,
            isAdmin 
        });
    } catch (error) {
        next(error);
    }
};


exports.getError = (req, res, next) => {
    res.render("error");
};
