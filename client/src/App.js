import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [wardrobe, setWardrobe] = useState([]);
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (authenticated) {
      fetchWardrobe();
    }
  }, [authenticated]);

  const fetchWardrobe = () => {
    axios
      .get(`https://wardrobe-zj0u.onrender.com/wardrobe?username=${username}`)
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
      .post(
        `https://wardrobe-zj0u.onrender.com/upload?username=${username}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      .then((response) => {
        fetchWardrobe(); // Refresh wardrobe after upload
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLogin = () => {
    // Send login credentials to backend for authentication
    axios
      .post('https://wardrobe-zj0u.onrender.com/login', { username, password })
      .then((response) => {
        if (response.data.success) {
          setAuthenticated(true);
        } else {
          alert('Invalid username or password');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Error logging in');
      });
  };

  return (
    <div>
      {!authenticated ? (
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
          <button onClick={handleUpload}>Upload</button>

          <h2>My Wardrobe</h2>
          <div>
            {wardrobe.map((item) => (
              <img
                key={item._id}
                src={item.image}
                alt='Wardrobe Item'
                style={{ width: 'auto', height: '300px', margin: '5px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
