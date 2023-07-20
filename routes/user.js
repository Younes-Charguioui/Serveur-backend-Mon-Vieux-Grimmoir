const express = require('express')
const router = express.Router()

const userControl = require('../controllers/user')

router.post('/api/auth/signup', userControl.signup)
router.post('/api/auth/login', userControl.login)

module.exports = router