const isAdmin = (req, res, next) => {
    if (req.userInfo.role !== "admin"){
        return res.status(403).json({
            suceess: false,
            message: "only available to admin"
        })
    }
    next()
}

module.exports = isAdmin