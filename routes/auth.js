const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../models/user')
const auth = require('../middlware/auth')
require('dotenv').config()

//@ POST
//@ DESC - login
//@ PUBLIC
router.post('/login', (req, res) => {
    const { email, password } = req.body
    if (email === '' || password === '') return res.status(400).json({ msg: 'Username and password is required!' })

    User.findOne({ email }).then((user) => {
        if (!user) return res.status(400).json({ msg: 'User does not exist' })
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (!isMatch) return res.status(400).json({ msg: 'Username and password is incorrect!' })
            jwt.sign({
                id: user._id,
                name: user.name
            },
                process.env.SECRET_KEY, { expiresIn: '45m' },
                (err, token) => {
                    if (err) return res.status(400).json({ error: err })
                    res.status(200).json({
                        msg: 'Login Successfully',
                        token,
                        user: {
                            _id: user._id,
                            name: user.name,
                            role: user.role,
                            email: user.email,
                            purchases: user.purchases
                        }
                    })
                }
            )
        })
    })
})
//@GET
//@DESC - set user when refreshed
//@PRIVATE 
router.get('/', auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .select('-createdAt')
        .select('-updatedAt')
        .then((user) => {
            res.status(200).json(user)
        })
        .catch(err => {
            res.status(400).json({ error: err })
        })
})
module.exports = router