const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const User = require("../Models/User")
const Message = require("../Models/Message")

exports.getAllUsers = async (req, res, next) => {
    try{
        const users = await User.find()

        if(!users){
            return res.status(404).json({
                message: "No users found"
            })
        }

        res.status(200).json({
            users
        })
    }catch(err){
        res.status(500).json("Server error")
    }
}

const createToken = (user) => {
    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
    }, process.env.TOKENKEY, {expiresIn: "1h"})

    return token
}

const register = async (res, username, email, password, isAdmin) => {
    try{
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            username,
            email,
            hashedPassword,
            isAdmin
        })

        const savedUser = await user.save()

        if(!savedUser){
            return res.status(500).json({
                error: "Cannot save user"
            })
        }

        const token = createToken(savedUser)

        const newUser = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email
        }

        return res.status(201).json({
            token: token,
            user: newUser,
            isAdmin: savedUser.isAdmin
        })
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
}

exports.signup = async (req, res, next) => {
    try{
        let isAdmin
        const {username, email, password} = req.body


        if(!username || !email || !password){
            return res.status(400).json({
                error: "Please enter all required fields"
            })
        }

        if(username.length < 3){
            return res.status(400).json({
                error: "Username is less than 3 characters"
            })
        }

        const emailRegex = /(gmail.com|mail.com)$/
        if(!emailRegex.test(email)) return res.status(400).json({
            error: "Enter a correct email"
        })

        if(password.length < 6){
            return res.status(400).json({
                error: "Password is less than 6 characters"
            })
        }

        const usersCount = await User.countDocuments({})

        if(usersCount <= 0){
            isAdmin = true
            register(res, username, email, password, isAdmin)
        }else{
            const existingUser = await User.findOne({
                username: username,
                email: email
            }).select("+hashedPassword")

            if(!existingUser){
                isAdmin = false
                register(res, username, email, password, isAdmin)
            }else{
                const match = checkPasswords(password, existingUser.hashedPassword)

                if(!match){
                    return res.status(400).json({
                        error: "Password does not match"
                    })
                }

                const token = createToken(existingUser)

                const user = {
                    id: existingUser._id,
                    username: existingUser.username,
                    email: existingUser.email
                }

                return res.status(201).json({
                    token: token,
                    user: user,
                    isAdmin: existingUser.isAdmin
                })
            }
        }
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
}

async function checkPasswords(password, hashedPassword){
    const match = bcrypt.compare(password, hashedPassword)
    return match
}

exports.createMessage = async (req, res, next) => {
    try{
        const message = new Message({
            message: req.body.message,
            userCreated: req.currentUser.id
        })
    
        const newMessage = await message.save()
    
        if(!newMessage){
            return res.status(400).json({
                error: "Cannot save message"
            })
        }
    
        res.status(201).json({
            message: newMessage
        })
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
}

