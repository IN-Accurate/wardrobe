import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [wardrobe, setWardrobe] = useState([]);
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categoryOptions = [
    'tops',
    'bottoms',
    'headgear',
    'footwear',
    'accessories',
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchWardrobe();
    }
  }, [isLoggedIn]);
  const fetchWardrobe = () => {
    axios
      .get(`https://wardrobe-zj0u.onrender.com/wardrobe/${username}`)
      .then((response) => {
        // Parse filename and category from the response data
        const wardrobeWithCategories = response.data.map((item) => ({
          filename: item.filename,
          category: item.category,
        }));
        setWardrobe(wardrobeWithCategories);
        console.log(wardrobeWithCategories);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value); // Ensure selectedCategory is set correctly
  };
  const handleUpload = () => {
    if (!image || !selectedCategory) {
      console.error('No file selected or category not selected');
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const imageData = event.target.result;

      axios
        .post(`https://wardrobe-zj0u.onrender.com/upload/${username}`, {
          image: imageData,
          category: selectedCategory,
        })
        .then((response) => {
          fetchWardrobe(); // Refetch wardrobe to update with the new item
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    reader.readAsDataURL(image);
  };

  const handleLogin = () => {
    axios
      .post('https://wardrobe-zj0u.onrender.com/login', { username, password })
      .then((response) => {
        setIsLoggedIn(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <h1>Login</h1>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h1>Digital Wardrobe</h1>
          <h2>Upload Clothes</h2>
          <input type='file' onChange={handleImageChange} />
          Category:
          <input
            type='text'
            placeholder='Enter Category'
            value={selectedCategory}
            onChange={handleCategoryChange}
          />
          <button onClick={handleUpload}>Upload</button>
          <h2>My Wardrobe</h2>
          <p>Click an item to pause/resume its carousel</p>
          {categoryOptions.map((category) => (
            <div key={category}>
              <h3>{category}</h3>
              <div className='wardrobe-container'>
                {wardrobe.map((item) =>
                  item.category === category ? (
                    <img
                      key={item.filename}
                      src={`https://wardrobe-zj0u.onrender.com/uploads/${item.filename}`}
                      alt='Wardrobe Item'
                      className='wardrobe-item'
                      style={{
                        width: 'auto',
                        height: '300px',
                        margin: '5px',
                        cursor: 'pointer',
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
