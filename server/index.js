const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

const uploadsDirectory = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsDirectory));
app.use(cors());
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src data: https://www.google-analytics.com; font-src 'self' https://wardrobe-zj0u.onrender.com;"
  );
  next();
});
app.use('/uploads', express.static(uploadsDirectory));
app.use(cors());
app.use(express.json()); // Parse JSON bodies
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from localhost:3000
};

app.use(cors(corsOptions));

// MongoDB connection
mongoose.connect('mongodb+srv://admin:admin@cluster0.jirdz5d.mongodb.net/', {
  useNewUrlParser: true,
});

// Define MongoDB schema and model for users
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// User login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      // If user does not exist, create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        username,
        password: hashedPassword,
      });
      await user.save();
      return res.json({
        success: true,
        message: 'New user created successfully',
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid username or password' });
    }
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware to authenticate users
const authenticateUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized access' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized access' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Endpoint to fetch wardrobe items (accessible only to authenticated users)
app.get('/wardrobe', authenticateUser, (req, res) => {
  const { username } = req.body;

  fs.readdir(path.join(uploadsDirectory, username), (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const wardrobe = files.map((file) => ({
        _id: file,
        image: `https://wardrobe-zj0u.onrender.com/uploads/${username}/${file}`,
      }));
      res.status(200).json(wardrobe);
    }
  });
});

// Endpoint to handle file upload (accessible only to authenticated users)
app.post('/upload', authenticateUser, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (req.file === undefined) {
        res.status(400).json({ error: 'No file selected' });
      } else {
        const { username } = req.body;
        res.status(200).json({
          message: 'File uploaded successfully',
          filename: req.file.filename,
          username: username,
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
