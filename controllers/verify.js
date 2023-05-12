const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.token;
    if (!token) return res.status(401).json('Not authenticated...');
    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (e, p) => {
        if (e) return res.status(403).json('Invalid token...');
        req.user = p;
        next();
    })
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req,res,()=>{
        if(req.user._id === req.params.id || req.user.rule === 'admin' || req.user.rule === 'cashier') next();
        else res.status(403).json("Unauthorized");  
    })
}

const verifyTokenAndChef = (req, res, next) => {
    verifyToken(req,res,async()=>{
        if(req.user.rule === 'chef' || req.user.rule === 'admin') next();
        else{
            res.status(403).json("Unauthorized");  
        }
    })
}

const verifyTokenAndCashier = (req, res, next) => {
    verifyToken(req,res,async()=>{
        if(req.user.rule === 'cashier' || req.user.rule === 'admin') next();
        else{
            res.status(403).json("Unauthorized");  
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req,res,async()=>{
        if(req.user.rule === 'admin') next();
        else res.status(403).json("Unauthorized");  
    })
}

const verifyTokenAndManager = (req, res, next) => {
    verifyToken(req,res,async()=>{
        if(req.user.rule === 'cashier' || req.user.rule === 'admin' || req.user.rule === 'chef') next();
        else{
            res.status(403).json("Unauthorized");  
        }
    })
}


module.exports = {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
    verifyTokenAndChef,
    verifyTokenAndCashier,
    verifyTokenAndManager
}