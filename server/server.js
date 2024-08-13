const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // Add this line
const path = require('path'); // Add this line
const fs = require('fs');
const app = express();
const port = 3000;

const mongoose = require('./mongodb'); // Import the mongoose connection

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Mongoose schema and model
const productSchema = new mongoose.Schema({
  name: String,
  code: String,
  price: Number,
  categories: String,
  images: [String],
  more_details_about_the_product: String,
  Reviews: String ,
  Shipping_time: String,
  Url: String
});
// Mongoose schema and model for users
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const categorySchema = new mongoose.Schema({
  name: String,
  subcategories: [String], // Add an array of strings for subcategories
});



const User = mongoose.model('User', userSchema, 'users');

const Category = mongoose.model('Category', categorySchema, 'categories');

const Product = mongoose.model('Product', productSchema, 'products');

const uploadDir = path.join(__dirname, 'uploads'); // Use path.join for compatibility

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDir)); // Serve static files from the upload directory




// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found.');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
app.post('/api/products', upload.array('images', 10), async (req, res) => {
  try {
    const { name, code, price, categories, more_details_about_the_product, Reviews, Shipping_time, Url } = req.body;
    const images = req.files.map(file => file.path);

    const newProduct = new Product({
      name,
      code,
      price,
      categories,
      images,
      more_details_about_the_product,
      Reviews,
      Shipping_time,
      Url
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: err.message });
  }
});


app.use('/uploads', express.static('uploads'));


// Update an existing product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, code, price,categories, images,more_details_about_the_product,Reviews,Shipping_time,Url } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).send('Product not found.');

    product.name = name || product.name;
    product.code = code || product.code;
    product.price = price || product.price;
    product.categories = categories || product.categories;
    product.images = images  || product.images;
    product.more_details_about_the_product = more_details_about_the_product || product.more_details_about_the_product;
    product.Reviews = Reviews || product.Reviews;
    product.Shipping_time = Shipping_time || product.Shipping_time;
    product.Url = Url || product.Url;


    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send('Product not found.');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    
    const newCategory = new Category({
      name,
      subcategories,
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Assuming you have a user authentication mechanism in place
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (user) {
      res.json({ username: user.username });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});




// Login route
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    res.status(200).json({ userId: user._id, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});




// Register a new user
app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
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
      .then(user => res.status(201).json(newUser))
      .catch(err => res.status(400).json({ error: err.message }));
  });
  app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});