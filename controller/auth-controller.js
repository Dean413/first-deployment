
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../model/auth")


//register controller
const registerUser = async(req,res)=>{
    try {
        //extract user information from our front end
        const {username, email, password, role} = req.body

        //check if the user is already registered
        const checkRegisteredUser = await User.findOne({$or: [{username}, {email}]})
        if(checkRegisteredUser){
            return res.status(400).json({
                success: false,
                message: "user is already registered, please log in"
            })
        }

        //hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //create a new user and save in database
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role : role || "user"
        })

        await newUser.save()

        if(newUser){
            res.status(201).json({
                success: true,
                message: "user registered successfully"
            })
        }
        
        else{
            res.status(400).json({
                success: false,
                message: "unable to register user, please try again"
            })

        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: "an error occured, please try again"
        })   
    }
}

//login controller

const loginUser = async(req,res)=>{
    try {
        const {username, password} = req.body

        //find if the current user exists in the database
        const userLogin = await User.findOne({username});
        if(!userLogin){
            return res.status(404).json({
                success: false,
                message: "user does not exist"
            })
        }

        //authenticate password
        const isPasswordMatch = await bcrypt.compare(password, userLogin.password)
        if(!isPasswordMatch) {
            return res.status(404).json({
                success: false,
                message: "invalid login details"
            })
        }

        //create user token
        const accessToken = jwt.sign({
            userId: userLogin._id,
            username: userLogin.username,
            role: userLogin.role
        }, process.env.JWT_SECRET_KEY, {
            expiresIn: "31m"
        })

        res.status(200).json({
            success: true,
            message: "logged  in successful",
            accessToken
        })    
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            error: e.message
        })    
    }
}

const changePassword = async(req,res)=>{
    try {
        const userId = req.userInfo.userId
        
        //extract old and new password
        const {oldpassword, newpassword} = req.body 

        //find the current logged in user
        const user = await User.findById(userId)

        if(!user){
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        //check if old password is correct
        const isPasswordMatch = await bcrypt.compare(oldpassword, user.password)

        if(!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Old Password is not correct, please try again"
            })
        }

        //Hash the new password
        const salt = await bcrypt.genSalt(10)
        const newHashedPassword = await bcrypt.hash(newpassword, salt)

        //update password
        user.password = newHashedPassword
        await user.save()

        res.status(200).json({
            success: true,
            message: "password changed succesfully"
        })
        
    } catch (e) {
         console.log(e)
        res.status(500).json({
            success: false,
            error: e.message
        })  
    }
}

module.exports = {loginUser, registerUser, changePassword}
