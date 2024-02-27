const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.get('/wardrobe', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const wardrobe = files.map((file) => ({
        _id: file,
        image: `http://localhost:5000/uploads/${file}`,
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
