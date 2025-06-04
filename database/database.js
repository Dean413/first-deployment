const mongoose = require("mongoose")


const dataBase = async ()=>{
    try {
       await mongoose.connect(process.env.MONGO_URL)
        console.log("database connected successfully")
    } catch (e) {
        console.error("connection failed")    
        process.exit(1)
    }
}

module.exports = dataBase;