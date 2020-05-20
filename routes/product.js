const express = require('express')
const mongoose = require('mongoose')

const router = express.Router()

const auth = require('../middlware/auth')

const Product = require('../models/product')
const User = require('../models/user')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({ storage, fileFilter });
const transporter = require('../middlware/transporter')
//@GET 
//@DESC - get products
//@PRIVATE
router.get('/', auth, (req, res) => {
    Product.find()
        .then((product) => {
            res.status(200).json(product)
        })
        .catch(err => {
            res.status(400).json(err)
        })
})


//@ PUT
//@ DESC - products purchased!
//@ PRIVATE 
router.put('/buy/:id', auth, async (req, res) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    })
    const { productName, price, category, quantity, userId, email, purchasedId } = req.body
    const mailOptions = {
        from: 'serilorenz112792@gmail.com',
        to: email,
        subject: 'Thank you for purchasing at Zner-Store',
        html: `<h4 style="font-size:30px;color:red;font-weight:bold;font-family:sans-serif;font-style:italic; text-align:center">Item Details</h4>
               <span style="font-family:sans-serif;font-style:italic;font-weight:bold; text-align:center">
                   <form>
                    <label for="category">Category:</label>
                    <span style="color:violet;font-weight:bold;font-family:sans-serif;font-style:italic" id="category">${category}</span>
                    <br/>
                    <label for="name">Product Name:</label>
                    <span style="color:violet;font-weight:bold;font-family:sans-serif;font-style:italic" id="name">${productName}</span>
                    <br/>
                    <label for="price">Price:</label>
                    <span style="color:violet;font-weight:bold;font-family:sans-serif;font-style:italic" id="price">${formatter.format(price)}</span> 
                    <br/>
                    <label for="quantity">Quantity:</label>
                    <span style="color:violet;font-weight:bold;font-family:sans-serif;font-style:italic" id="quantity">${quantity}</span>
                   </form> 
               </span>
              `
    }
    const product = await Product.findById(req.params.id)

    const purchasedProduct = {
        productId: req.params.id, productName, price, category, quantity, imgPath: product.imgPath, purchasedId
    }

    const user = await User.findById({ _id: userId })
    user.purchases.push(purchasedProduct)

    let newQty = product.quantity - quantity

    Product.findByIdAndUpdate(req.params.id, { quantity: newQty })
        .then(() => {
            let emailMsg = {}
            transporter.sendMail(mailOptions, (err, info) => {
                //if (err)
                err ? emailMsg = err : emailMsg = info
                //return res.status(400).json({ msg: 'Failed to send email', emailError: err })


                user.save()
                res.status(200).json({ msg: `Successfully purchased ${productName}`, emailMsg })

            })
        })
        .catch((err) => {
            res.status(400).json({
                msg: 'Failed to purchase',
                error: err
            })
        })


})


//@POST
//@DESC - add product for Admin users
//@PRIVATE
router.post('/add', upload.single('productImage'), (req, res) => {
    let newProduct = {}
    if (req.file === undefined || req.file.path === undefined) {
        newProduct = new Product({
            productName: req.body.productName,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity
        })
    }
    else {
        newProduct = new Product({
            productName: req.body.productName,
            category: req.body.category,
            price: req.body.price,
            quantity: req.body.quantity,
            imgPath: req.file.path
        })
    }
    newProduct
        .save()
        .then(() => {
            res.status(200).json({ msg: 'Item Created' })
        })
        .catch(err => {
            res.status(400).json({ msg: 'Failed to create item', error: err })
        })
})


//@PUT
//@Desc - Edit Products
//@PRIVATE

router.put('/edit/:id', upload.single('productImage'), (req, res) => {
    const { quantity, price, productName } = req.body

    let newProduct = {}
    if (req.file === undefined || req.file.path === undefined) {
        newProduct = {
            quantity,
            price,
            productName
        }
    }
    else {
        newProduct = {
            quantity,
            price,
            productName,
            imgPath: req.file.path
        }
    }
    Product.findByIdAndUpdate(req.params.id, newProduct)
        .then((product) => {
            res.status(200).json({ msg: 'Item updated' })
        })
        .catch(err => {
            res.status(400).json({ msg: 'Failed to update item', error: err })
        })
})

//@DELETE
//@Desc - Delete a product
//@PRIVATE

router.delete('/delete/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(200).json({ msg: 'Item Deleted!' })
        })
        .catch(err => {
            res.status(200).json({ msg: 'Failed to delete an item', error: err })
        })
})

module.exports = router