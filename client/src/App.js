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
  const [carouselDirection, setCarouselDirection] = useState('left');

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselDirection((prevDirection) =>
        prevDirection === 'left' ? 'right' : 'left'
      );
    }, 5000); // Change direction every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchWardrobe = () => {
    axios
      .get(`https://wardrobe-zj0u.onrender.com/wardrobe/${username}`)
      .then((response) => {
        setWardrobe(
          response.data.map((item) => ({
            filename: item.filename,
            category: item.category,
          }))
        );
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
      .post(`https://wardrobe-zj0u.onrender.com/upload/${username}`, formData, {
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

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleItemClick = (filename) => {
    // Handle item selection
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
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value=''>Select Category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button onClick={handleUpload}>Upload</button>

          <h2>My Wardrobe</h2>
          <p>Click one item from each row to pick it</p>
          <div className='wardrobe-container'>
            {categoryOptions.map((category) => (
              <div
                key={category}
                className='category-row'
                style={{ animationDirection: carouselDirection }}
              >
                {wardrobe.map(
                  (item) =>
                    item.category === category && (
                      <img
                        key={item.filename}
                        src={`https://wardrobe-zj0u.onrender.com/uploads/${item.filename}`}
                        alt='Wardrobe Item'
                        style={{
                          width: 'auto',
                          height: '300px',
                          margin: '5px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleItemClick(item.filename)}
                      />
                    )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
