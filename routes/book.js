const express = require('express')
const router = express.Router()

const bookControl = require('../controllers/book')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const sharp = require('../middleware/sharp')


router.post('/api/books', auth, multer, sharp, bookControl.createBook)

router.get('/api/books/bestrating', bookControl.getBestRatingsBooks)

router.get('/api/books', bookControl.getAllBooks)

router.post('/api/books/:id/rating', auth, bookControl.rateBook)

router.get('/api/books/:id', bookControl.getOneBook)

router.put('/api/books/:id', auth, multer, sharp, bookControl.modifyBook)

router.delete('/api/books/:id', auth, bookControl.deleteBook)

module.exports = router