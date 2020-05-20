const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const router = express.Router()

const User = require('../models/user')
const auth = require('../middlware/auth')

//@ POST
//@ DESC - To create a new user
//@ PUBLIC
router.post('/register', (req, res) => {
    const { name, email, password } = req.body
    if (name === '' || email === '' || password === '') return res.status(400).json({ msg: 'All fields are required' })
    let role = ''
    if (email.toLowerCase().includes('admin')) role = 'Admin'
    else role = 'Customer'
    const newUser = User({
        name,
        email,
        password,
        role
    })
    User.findOne({ email }).then((user) => {

        if (user) return res.status(400).json({ msg: 'Username already exist' })
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.status(400).json({ error: err })
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) return res.status(400).json({ error: err })
                newUser.password = hash
                newUser.save().then((user) => {
                    res.status(200).json({ msg: 'Created successfully!' })
                }).catch(err => {
                    res.status(400).json({ msg: 'Failed to create a user!', error: err })
                })
            })
        })
    })

})

//@ GET
//@ DESC - get all the users
//@ PUBLIC
router.get('/', (req, res) => {
    User.find()
        .then((user) => {
            res.status(200).json(user)
        })
        .catch(err => {
            res.status(400).json({ error: err })
        })
})


//@DELETE 
//@DESC - delete purchased item on profile list
//@PRIVATE 
router.put('/removeitem/:id', auth, async (req, res) => {
    //id = userId
    await User.update({ _id: req.params.id },
        { $pull: { purchases: { purchasedId: req.body.purchasedId } } })
        .then(() => {
            res.status(200).json({ msg: 'Item removed!' })
        })
        .catch(err => {
            res.status(400).json({ msg: 'Failed to remove item', error: err })
        })
})

//@GET
//@DESC - get all purchases of a user
//@PRIVATE
router.get('/purchases/:id', auth, async (req, res) => {
    //id = userId
    await User.findById(req.params.id)
        .then(user => {
            //const purchases = user.purchases
            res.status(200).json({ item: user.purchases })
        })
        .catch(err => {
            res.status(400).json({ msg: 'Failed to get purchases' })
        })
})


module.exports = router