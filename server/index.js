const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

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

const upload = multer({ storage: storage }).single('image'); // Define multer middleware as single file upload

app.get('/wardrobe', (req, res) => {
  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const wardrobe = files.map((file) => ({
        _id: file,
        image: `https://wardrobe-zj0u.onrender.com/uploads/${file}`,
      }));
      res.status(200).json(wardrobe);
    }
  });
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (req.file === undefined) {
        res.status(400).json({ error: 'No file selected' });
      } else {
        res.status(200).json({
          message: 'File uploaded successfully',
          filename: req.file.filename,
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
