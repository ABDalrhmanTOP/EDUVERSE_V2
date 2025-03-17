import React, { useEffect, useState } from 'react';
import UserForm from './UserForm';
import axios from "../../api/axios";
import { Modal } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import "../../styles/Auth.css";
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
      console.log(response.data)
      setError('');
    } catch (error) {
      console.error(error);
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete the user?")) {
      axios.delete(`/users/${id}`)
        .then(() => fetchUsers())
        .catch(error => {
          console.error(error);
          setError('An error occurred while deleting the user.');
        });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchUsers();
  };

  return (
    <div className="container my-4 p-4 bg-light rounded shadow">
      <h2 className="mb-4 text-center text-primary">User Management</h2>
      <div className="text-center mb-3">
        <button className="btn btn-success px-4 py-2" onClick={() => setShowForm(true)}>
          + Add New User
        </button>
      </div>
      {loading ? (
        <div className="alert alert-info text-center">Loading data...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-striped table-hover table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Form Test</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-muted">No data available</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.test_taken ? "True" : "False"}</td>
                    <td>
                      <button className="btn btn-sm btn-primary-400 mx-1" onClick={() => navigate(`/AdminDashboard/userdetail/${user.id}`)}>View</button>
                      <button className="btn btn-sm btn-primary mx-1" onClick={() => handleEdit(user)}>Edit</button>
                      <button className="btn btn-sm btn-danger mx-1" onClick={() => handleDelete(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal  show={showForm} onHide={() => setShowForm(false)} centered>
        <div className="auth-container1 animated-form">
       <Modal.Header closeButton />
        <Modal.Body>
          <UserForm editingUser={editingUser} onSuccess={handleFormSuccess} onClose={() => setShowForm(false)} />
        </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default UsersList;
