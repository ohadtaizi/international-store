const express = require('express'); // Import the Express library
const bodyParser = require('body-parser'); // Import the body-parser middleware
const cors = require('cors'); // Import the CORS middleware
const multer = require('multer'); // Import the multer library for handling file uploads
const path = require('path'); // Import the path module for handling file paths
const fs = require('fs'); // Import the fs module for file system operations
const app = express(); // Create an Express application
const port = 3000; // Define the port number for the server

const mongoose = require('./mongodb'); // Import the mongoose connection from the local file

app.use(bodyParser.json()); // Use the body-parser middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Define the Mongoose schema and model for products
const productSchema = new mongoose.Schema({
  name: String,
  code: String,
  price: Number,
  categories: String,
  image: String,
  more_details_about_the_product: String,
  Reviews: String,
  Shipping_time: String,
  Url: String
});

// Define the Mongoose schema and model for users
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Define the Mongoose schema and model for categories
const categorySchema = new mongoose.Schema({
  name: String,
  subcategories: [String], // Add an array of strings for subcategories
});

// Create Mongoose models for users, categories, and products
const User = mongoose.model('User', userSchema, 'users');
const Category = mongoose.model('Category', categorySchema, 'categories');
const Product = mongoose.model('Product', productSchema, 'products');

const uploadDir = path.join(__dirname, 'uploads'); // Define the directory for file uploads

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create the uploads directory if it doesn't exist
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Set the filename for uploaded files
  }
});
const upload = multer({ storage: storage }); // Create an upload instance with the storage configuration

app.use('/uploads', express.static(uploadDir)); // Serve static files from the upload directory

// Route to get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    res.json(products); // Send the products as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Route to get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Fetch a product by ID from the database
    if (!product) return res.status(404).send('Product not found.'); // Send a 404 response if the product is not found
    res.json(product); // Send the product as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Route to create a new product
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, code, price, categories, more_details_about_the_product, Reviews, Shipping_time, Url } = req.body;
    const image = req.file ? req.file.path : null; // Get the file path of the uploaded image

    const newProduct = new Product({
      name,
      code,
      price,
      categories,
      image,
      more_details_about_the_product,
      Reviews,
      Shipping_time,
      Url
    });

    await newProduct.save(); // Save the new product to the database
    res.status(201).json(newProduct); // Send the new product as a JSON response
  } catch (err) {
    res.status(400).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Serve static files from the upload directory
app.use('/uploads', express.static('uploads'));

// Route to update an existing product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, code, price, categories, image, more_details_about_the_product, Reviews, Shipping_time, Url } = req.body;
    const product = await Product.findById(req.params.id); // Fetch the product by ID from the database
    
    if (!product) return res.status(404).send('Product not found.'); // Send a 404 response if the product is not found

    // Update the product fields with the new values or keep the existing values if not provided
    product.name = name || product.name;
    product.code = code || product.code;
    product.price = price || product.price;
    product.categories = categories || product.categories;
    product.image = image || product.image;
    product.more_details_about_the_product = more_details_about_the_product || product.more_details_about_the_product;
    product.Reviews = Reviews || product.Reviews;
    product.Shipping_time = Shipping_time || product.Shipping_time;
    product.Url = Url || product.Url;

    await product.save(); // Save the updated product to the database
    res.json(product); // Send the updated product as a JSON response
  } catch (err) {
    res.status(400).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Route to delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id); // Delete the product by ID from the database
    if (!product) return res.status(404).send('Product not found.'); // Send a 404 response if the product is not found
    res.json(product); // Send the deleted product as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Route to create a new category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    
    const newCategory = new Category({
      name,
      subcategories,
    });

    await newCategory.save(); // Save the new category to the database
    res.status(201).json(newCategory); // Send the new category as a JSON response
  } catch (err) {
    res.status(400).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Route to get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories from the database
    res.json(categories); // Send the categories as a JSON response
  } catch (err) {
    res.status(500).json({ error: err.message }); // Send an error response if something goes wrong
  }
});

// Route to get user information by user ID
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId); // Fetch the user by ID from the database
    if (user) {
      res.json({ username: user.username }); // Send the user's username as a JSON response
    } else {
      res.status(404).json({ message: 'User not found' }); // Send a 404 response if the user is not found
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message }); // Send an error response if something goes wrong
  }
});

// Route for user login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // Find a user by email in the database

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Incorrect username or password' }); // Send a 401 response if the email or password is incorrect
    }

    res.status(200).json({ userId: user._id, message: 'Login successful' }); // Send a success response with the user ID
  } catch (err) {
    res.status(500).json({ message: 'Server error' }); // Send an error response if something goes wrong
  }
});

// Route for user registration
app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' }); // Send a 400 response if any field is missing
  }

  // Create a new user instance
  const newUser = new User({
    id: Date.now(),
    username,
    email,
    password
  });

  // Save the user to the database
  newUser.save()
    .then(user => res.status(201).json(newUser)) // Send the new user as a JSON response
    .catch(err => res.status(400).json({ error: err.message })); // Send an error response if something goes wrong
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`); // Start the server and log the port number
});
