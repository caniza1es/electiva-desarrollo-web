exports.getIndex = (req,res,next) => {
    res.status(200).render("index")
}

exports.testError = (req, res, next) => {
    const error = new Error("Algo salio mal");
    error.status = 500; 
    next(error); 
}