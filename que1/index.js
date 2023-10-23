const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Set up MongoDB connection
mongoose.connect('mongodb://0.0.0.0/Userdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatar: String,
  gallery: [String],
});

const User = mongoose.model('User', UserSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Serve the registration form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/reg.html');
});

// Handle form submission
app.post(
  '/register',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 },
  ]),
  [
    body('name').trim().isLength({ min: 2 }).escape().withMessage('Name must be at least 2 characters long'),
    body('email').isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Handle validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const avatar = req.files['avatar'] ? req.files['avatar'][0].filename : null;
    const gallery = req.files['gallery'] ? req.files['gallery'].map((file) => file.filename) : [];

    // Create a new user
    const newUser = new User({ name, email, password, avatar, gallery });

    try {
      // Save the user to the database
      await newUser.save();
      res.json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});