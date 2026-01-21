const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true)
    } else {
        cb(new Error('Only image files allowed'), false)
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter
})

module.exports = upload
