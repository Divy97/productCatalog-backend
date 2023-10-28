const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors())
app.use(bodyParser.json());
// Set up file storage for images using Multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Connect to MongoDB (make sure MongoDB is running)
mongoose.connect('mongodb+srv://divyparekh1810:PJZXyJoonj0YjZYj@cluster0.yjnnuwo.mongodb.net/productCatalog', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

app.get('/users', async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/products', async (req, res) => {
    try {
        // Retrieve all products from the database
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find a user with the provided email
        const user = await User.findOne({ email });

        if (user) {
            // Compare the provided password with the stored password (after hashing)
            if (user.password === password) {
                // Successful sign-in
                res.json({ message: 'Sign-in successful', user });
            } else {
                // Incorrect password
                res.status(401).json({ message: 'Invalid password' });
            }
        } else {
            // User with the provided email doesn't exist
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Create a new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/addProduct', upload.single('image'), async (req, res) => {
    const {
        productName,
        productDescription,
        productCategory,
        quantity,
        price,
        sellerName,
        sellerPhoneNumber,
        sellerAddress,
        discount,
    } = req.body;

    try {
        let imageBase64 = null;

        if (req.file) {
            // Read the uploaded image as a binary buffer and convert it to base64
            const imageBuffer = fs.readFileSync(req.file.path);
            imageBase64 = imageBuffer.toString('base64');

            // Delete the temporary file after reading it
            fs.unlinkSync(req.file.path);
        }

        const newProduct = new Product({
            productName,
            productDescription,
            image: imageBase64, // Store the image as a base64 string
            productCategory,
            quantity,
            price,
            sellerName,
            sellerPhoneNumber,
            sellerAddress,
            discount,
        });

        await newProduct.save();

        res.status(201).json({ message: 'Product added successfully', productData: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
