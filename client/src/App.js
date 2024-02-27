import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [wardrobe, setWardrobe] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = () => {
    axios
      .get('https://wardrobe-zj0u.onrender.com/wardrobe')
      .then((response) => {
        setWardrobe(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('image', image);

    axios
      .post('https://wardrobe-zj0u.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        fetchWardrobe(); // Refresh wardrobe after upload
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Digital Wardrobe</h1>
      <h2>Upload Clothes</h2>
      <input type='file' onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>

      <h2>My Wardrobe</h2>
      <div>
        {wardrobe.map((item) => (
          <img
            key={item._id}
            src={`https://wardrobe-zj0u.onrender.com/uploads/image-1709055955263.jpg`}
            alt='Wardrobe Item'
            style={{ width: 'auto', height: '300px', margin: '5px' }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
