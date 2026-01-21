const express = require('express')
const router = express.Router()
const upload = require('../middlewares/multer')
const authMiddleware = require('../middlewares/auth.middleware')
const productController = require('../controllers/product.controller')

router.use(authMiddleware.isAuthenticated).use(authMiddleware.isSeller)
router.post('/create-product',  upload.array('images', 5), productController.createProduct)

module.exports = router