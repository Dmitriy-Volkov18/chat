const jwt = require("jsonwebtoken")


const checkAth = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1]
        if(!token){
            return res.status(401).json({
                error: "You are not authorized"
            })
            // return next()
        }

        const decodedUser = await jwt.verify(token, process.env.TOKENKEY)
        req.currentUser = decodedUser

        next()
    }catch(err){
        res.status(401).json({
            error: "Token is not valid"
        })
    }
}

module.exports = checkAth