const express = require('express')
const mongoose = require('mongoose')

require('dotenv').config()

const app = express()

app.use(express.json())

const db = process.env.DB
const db2 = process.env.DB2

mongoose.connect(db2, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true }, () => {
    try {
        console.log('Connected to db')
    }
    catch (err) {
        console.log(err)
    }
})

app.use('/uploads', express.static('uploads'));


app.use('/api/users', require('./routes/user'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/product'))

app.listen(process.env.PORT, () => {
    try {
        console.log(`Running to port ${process.env.PORT}`)
    }
    catch (err) {
        console.log(err)
    }
})