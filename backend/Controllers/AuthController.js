const User = require("../Models/User")

exports.getUser = async (req, res, next) => {
    try{
        const user = await User.findById(req.currentUser.id)
        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            isAdmin: user.isAdmin
        })
    }catch(err){
        res.status(500).json("Server error")
    }
}
