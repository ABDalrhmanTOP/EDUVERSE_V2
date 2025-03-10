// src/components/UserForm.js
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../styles/Auth.css";
import { useNavigate } from 'react-router-dom';

const UserForm = ({ editingUser, onSuccess ,onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  // عند بدء التعديل، تعبئة الحقول
  useEffect(() => {
    console.log(username);
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setUsername(editingUser.username);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
    }
  }, [editingUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name,
      username,
      email
    };
    if (password === confirmpassword) {
      if (password) {
        data.password = password;
      }
    }

    if (editingUser) {
      axios.put(`/users/${editingUser.id}`, data)
        .then(response => {
          console.log("Updated User:", response.data); // تحقق من الرد القادم من API
          onSuccess();
        })
        .catch(error => console.error(error));

    } else {
      axios.post('/users', data)
        .then(response => onSuccess())
        .catch(error => console.error(error));
    }
  };

  return (
    <div>
      <div className="branding">
      <h2>{editingUser ? 'Update User' : 'Add User'}</h2>
      </div>
      <div className="form-section"> 
    <form onSubmit={handleSubmit}>
      
      <div>
        <input
          placeholder='name'
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        </div>
        <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="email"
          placeholder='Email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={editingUser ? '' : 'password'}
          required={!editingUser}
        />
        </div>
        <div>
        <input
            type="password"
            placeholder="Confirm Password"
            value={confirmpassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
      </div>
      <button type="submit">{editingUser ? 'update' : 'add'}</button>
    </form>
    </div>
    </div>
  );
};

export default UserForm;
