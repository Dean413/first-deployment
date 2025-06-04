require("dotenv").config()
const express = require("express")
const dataBase = require("./database/database")
const authRoutes = require("./routes/routes")
const homeRoutes = require("./routes/home-routes")
const adminRoutes = require("./routes/admin-routes")
const uploadImageRoutes = require("./routes/image-routes")
const path = require("path")


const app = express()
const PORT = process.env.PORT||5000

//middleware 
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/first", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "login.html"))
})

app.get("/", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "register.html"))
})
app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/home", homeRoutes)
app.use("/api/image", uploadImageRoutes)

const loadDatabase = async ()=>{
    try {
        await dataBase()
        app.listen(PORT, ()=>{
        console.log(`server is now listening on port ${PORT}`)
    })
        
    } catch (e) {
        e.message
    }
}
loadDatabase()