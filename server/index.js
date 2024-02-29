const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '100MB' }));
app.use(bodyParser.urlencoded({ limit: '100MB', extended: true }));
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from your frontend origin
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src data: https://www.google-analytics.com; font-src 'self' https://wardrobe-zj0u.onrender.com;"
  );
  next();
});

const uploadsDirectory = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsDirectory));

mongoose
  .connect('mongodb+srv://admin:admin@cluster0.jirdz5d.mongodb.net/wardrobe')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  wardrobe: [
    {
      filename: String,
      category: String,
    },
  ],
});

const User = mongoose.model('User', userSchema);

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      if (user.password === password) {
        res.status(200).send('Login successful');
      } else {
        res.status(401).send('Incorrect password');
      }
    } else {
      const newUser = new User({ username, password, wardrobe: [] });
      await newUser.save();
      res.status(201).send('User created');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/wardrobe/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (user) {
      res.status(200).json(user.wardrobe);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching wardrobe:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/upload/:username', multer().single('image'), async (req, res) => {
  const { username } = req.params;
  const { category } = req.body;
  const image = req.file; // multer stores the uploaded file in req.file

  if (!image || !category) {
    return res.status(400).json({ error: 'Image or category not provided' });
  }

  // Generate unique filename
  const filename = `image-${Date.now()}.png`;

  // Move the uploaded file to the uploads directory
  fs.renameSync(image.path, path.join(uploadsDirectory, filename));

  try {
    const user = await User.findOne({ username });
    if (user) {
      user.wardrobe.push({ filename, category });
      await user.save();
      res.status(200).json({
        message: 'File uploaded successfully',
        filename,
      });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
