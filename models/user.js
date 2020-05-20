const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: String,
    purchases: [Object]

}, {
    timestamps: true
})

module.exports = User = mongoose.model('user', userSchema)