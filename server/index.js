const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

mongoose
  .connect('mongodb+srv://admin:admin@cluster0.jirdz5d.mongodb.net/wardrobe')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const wardrobeSchema = new mongoose.Schema({
  username: String,
  category: String,
  imageUrl: String,
});

const User = mongoose.model('User', userSchema);
const Wardrobe = mongoose.model('Wardrobe', wardrobeSchema);

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'your_secret_key');
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ username, password: hashedPassword });
      await user.save();
      return res.status(201).json({ message: 'User created successfully' });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { user: { username: user.username } },
        'your_secret_key',
        {
          expiresIn: '1h',
        }
      );
      return res.status(200).json({ message: 'Login successful', token });
    } else {
      return res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/wardrobe', verifyToken, async (req, res) => {
  try {
    const wardrobe = await Wardrobe.find({ username: req.user.username });
    res.status(200).json(wardrobe);
  } catch (error) {
    console.error('Error fetching wardrobe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { category } = req.body;
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const wardrobeItem = new Wardrobe({
      username: req.user.username,
      category,
      imageUrl,
    });
    await wardrobeItem.save();
    res.status(201).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
