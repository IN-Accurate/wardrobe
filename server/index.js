const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

const uploadsDirectory = path.join(__dirname, 'uploads');

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
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDirectory);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage }).single('image');

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

app.post('/upload/:username', (req, res) => {
  const { username } = req.params;
  const { category } = req.body;
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (req.file === undefined) {
        res.status(400).json({ error: 'No file selected' });
      } else {
        try {
          const user = await User.findOne({ username });
          if (user) {
            user.wardrobe.push({
              filename: req.file.filename,
              category: category,
            });
            await user.save();
            res.status(200).json({
              message: 'File uploaded successfully',
              filename: req.file.filename,
            });
          } else {
            res.status(404).send('User not found');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
