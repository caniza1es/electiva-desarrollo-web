exports.getIndex = (req, res, next) => {
    res.render("index");
}

exports.getError = (req,res,next)=>{
    res.render("error")
}
