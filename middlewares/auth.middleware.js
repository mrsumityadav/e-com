const userModel = require('../models/user.model')
const blockListedModel = require('../models/blacklist.model')
const jwt = require('jsonwebtoken')

module.exports.isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization header missing" })
        }

        const token = authHeader.split(" ")[1]

        const isTokenBlockListed = await blockListedModel.findOne({ token })
        if (isTokenBlockListed) {
            return res.status(401).json({ message: "Token revoked" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded._id)
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }

        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}


module.exports.isSeller = async (req, res, next) => {
    try {
        const user = req.user
        if (user.role !== 'seller') {
            return res.status(401).json({
                message: 'Unauthorized'
            })
        }
        next()
    } catch (err) {
        next(err)
    }
}