const Message = require("../Models/Message")

exports.getAllMessages = async (req, res, next) => {
    try{
        const messages = await Message.find()

        if(!messages){
            return res.status(404).json({
                message: "No messages found"
            })
        }

        res.status(200).json({
            messages
        })
    }catch(err){
        res.status(500).json("Server error")
    }
}

exports.deleteAllMessages = async (req, res, next) => {
    try{
        await Message.deleteMany({})

        res.status(200).json({
            message: "All messages has been deleted"
        })
    }catch(err){
        res.status(500).json("Server error")
    }
}