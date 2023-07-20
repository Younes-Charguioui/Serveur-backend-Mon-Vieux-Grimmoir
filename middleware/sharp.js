const sharp = require('sharp')
const fs = require('fs')

module.exports = async (req, res, next) => {
    const mimetype = 'image/webp'
    const name = req.file.originalname.split(' ').join('-')
    const filename = name + Date.now() + '.webp'
    const path = "images\\" + filename
    await sharp(`./images/${req.file.filename}`)
      .webp({ quality: 20 })
      .toFile(`./images/${filename}`)
    fs.unlink(`images/${req.file.filename}`, (err) => {if (err) console.log("Un fichier d'image n'a pas était supprimé")})
    req.file.mimetype = mimetype
    req.file.filename = filename
    req.file.path = path
    delete req.file.size
    delete req.file.encoding
    next()
}

/*{
  fieldname: 'image',
  originalname: 'WhatsApp Image 2023-05-21 at 20.41.39.jpeg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'images',
  filename: 'WhatsApp_Image_2023-05-21_at_20.41.39.jpeg1689793426960.jpg',
  path: 'images\\WhatsApp_Image_2023-05-21_at_20.41.39.jpeg1689793426960.jpg',
  size: 103200
}*/