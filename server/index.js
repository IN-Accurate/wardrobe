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
app.use(bodyParser.json({ limit: '100mb' }));

app.use(
  cors({
    origin: 'http://localhost:3000', // Replace this with your frontend origin
  })
);
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
app.post('/upload/:username', (req, res) => {
  const { username } = req.params;
  const { image, category } = req.body; // Ensure that image and category are correctly parsed from the request body
  console.log(req.body);

  // Convert base64 image data to buffer
  const imageData = Buffer.from(image.split(',')[1], 'base64');

  // Generate unique filename
  const filename = `image-${Date.now()}.png`;

  // Write buffer to file
  const writeFileAsync = async () => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(uploadsDirectory, filename), imageData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  writeFileAsync()
    .then(async () => {
      try {
        const user = await User.findOne({ username });
        if (user) {
          user.wardrobe.push({ filename, category }); // Store category along with filename
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
    })
    .catch((error) => {
      console.error('Error writing file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
