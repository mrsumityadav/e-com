const cloudinary = require('../config/cloudinary')

module.exports.uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image required' })
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
                folder: 'products',
                resource_type: 'image'
            }
        )

        res.status(201).json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            public_id: result.public_id
        })
    } catch (error) {
        next(error)
    }
}