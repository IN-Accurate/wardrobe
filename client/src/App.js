import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const distance = 2;

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
      fetchWardrobe();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.offsetWidth;
      const cloneContent = contentRef.current.cloneNode(true);
      containerRef.current.appendChild(cloneContent);
      let distanceLeft = contentWidth;
      const move = () => {
        if (distanceLeft <= 0) {
          distanceLeft = contentWidth;
        } else {
          distanceLeft -= distance;
        }
        containerRef.current.style.transform = `translateX(-${distanceLeft}px)`;
      };
      const animation = setInterval(move, 30);
      return () => clearInterval(animation);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchWardrobe();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      if (res.status === 200) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', username); // Store the username
        setLoggedIn(true);
        fetchWardrobe();
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };
  const fetchWardrobe = async () => {
    try {
      const res = await axios.get('http://localhost:5000/wardrobe', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const username = localStorage.getItem('username'); // Get the logged-in username
      const userWardrobe = res.data.filter(
        (item) => item.username === username
      );
      const topsData = userWardrobe.filter((item) => item.category === 'tops');
      const bottomsData = userWardrobe.filter(
        (item) => item.category === 'bottoms'
      );
      setTops(topsData);
      setBottoms(bottomsData);
    } catch (error) {
      console.error('Error fetching wardrobe:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
  };

  return (
    <div>
      <h1>Wardrobe System</h1>
      {!loggedIn ? (
        <div>
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
          <button onClick={handleLogout}>Logout</button>
          <div>
            <input type='file' onChange={handleFileChange} />
            <select onChange={handleCategoryChange}>
              <option value=''>Select Category</option>
              <option value='tops'>Tops</option>
              <option value='bottoms'>Bottoms</option>
            </select>
            <button onClick={handleUpload}>Upload</button>
          </div>
          <div ref={containerRef} style={{ overflow: 'hidden' }}>
            <div ref={contentRef}>
              <h2>Tops</h2>
              <div>
                {tops.map((item, index) => (
                  <img
                    key={index}
                    src={item.imageUrl}
                    alt={`Top ${index}`}
                    style={{ width: '300px', height: '300px' }}
                  />
                ))}
              </div>
              <h2>Bottoms</h2>
              <div>
                {bottoms.map((item, index) => (
                  <img
                    key={index}
                    src={item.imageUrl}
                    alt={`Bottom ${index}`}
                    style={{ width: '300px', height: '300px' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
