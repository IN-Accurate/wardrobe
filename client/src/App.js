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
  const [pausedCategories, setPausedCategories] = useState([]);

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
        // Parse category from filename
        const wardrobeWithCategories = response.data.map((item) => {
          const filenameParts = item.filename.split('::::');
          return {
            filename: filenameParts[1],
            category: filenameParts[0],
          };
        });
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

  const handleUpload = () => {
    if (!image || !selectedCategory) {
      console.error('No file selected or category not selected');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('category', selectedCategory); // Add selected category to form data

    axios
      .post(`https://wardrobe-zj0u.onrender.com/upload/${username}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        fetchWardrobe(); // Refetch wardrobe to update with the new item
        console.log(response.data);
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
    const category = filename.split('::::')[0];
    setPausedCategories((prevPausedCategories) =>
      prevPausedCategories.includes(category)
        ? prevPausedCategories.filter((c) => c !== category)
        : [...prevPausedCategories, category]
    );
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
          <p>Click an item to pause/resume its carousel</p>
          {categoryOptions.map((category) => (
            <div
              key={category}
              style={{
                animationPlayState: pausedCategories.includes(category)
                  ? 'paused'
                  : 'running',
              }}
            >
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
                      onClick={() => handleItemClick(item.filename)}
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
