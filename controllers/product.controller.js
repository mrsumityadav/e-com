const cloudinary = require('../config/cloudinary')
const productModel = require('../models/product.model')

module.exports.createProduct = async (req, res, next) => {
    try {
        const { name, price, description } = req.body

        if (!name || !price || !description) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'At least one product image is required'
            })
        }

        // upload images to cloudinary
        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                { folder: 'products' }
            )
        )

        const results = await Promise.all(uploadPromises)

        //   const images = results.map(img => ({url: img.secure_url,public_id: img.public_id}))
        const images = results.map(img => img.secure_url)

        // DB save (example)
        const product = await productModel.create({
            name,
            price,
            description,
            images,
            seller: req.user._id
        })

        res.status(201).json({
            message: 'Product created successfully',
            product
        })
    } catch (error) {
        next(error)
    }
}
