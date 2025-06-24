import React, { useEffect, useState } from 'react';
import UserForm from './UserForm';
import axios from "../../api/axios";
import { Modal } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import "../../styles/Auth.css";
import { FaEdit , FaInfo, FaTrash} from 'react-icons/fa';

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
    <div className="container my-4 p-4 rounded shadow" style={{ backgroundColor: '#EAE0D5' }}>
      <h2 className="mb-4 text-center" style={{ color: '#5D3A00' }}>User Management</h2>
      <div className="text-center mb-3">
        <button className="btn px-4 py-2" style={{ backgroundColor: '#6B705C', borderColor: '#6B705C', color: '#ffffff' }} onClick={() => setShowForm(true)}>
          + Add New User
        </button>
      </div>
      {loading ? (
        <div className="alert alert-info text-center">Loading data...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-hover table-striped table-bordered text-center">
            <thead style={{ Color: '#A98467', borderColor: '#6B705C'}}>
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
                      <button className="btn btn-sm mx-1" style={{ backgroundColor: '#A98467', borderColor: '#A98467', color: '#fff' }} onClick={() => navigate(`/AdminDashboard/userdetail/${user.id}`)}><FaInfo/></button>
                      <button className="btn btn-sm mx-1" style={{ backgroundColor: '#A98467', borderColor: '#A98467', color: '#fff' }} onClick={() => handleEdit(user)}><FaEdit /></button>
                      <button className="btn btn-sm mx-1" style={{ backgroundColor: '#BC4749', borderColor: '#BC4749', color: '#fff' }} onClick={() => handleDelete(user.id)}><FaTrash/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}


      <Modal show={showForm} onHide={() => setShowForm(false)} centered  >
           
            {/* <Modal.Header closeButton style={{ backgroundColor: '#EAE0D5'}}>
              <Modal.Title></Modal.Title>
            </Modal.Header> */}
            <Modal.Body style={{ backgroundColor: '#EAE0D5'}} className="border-2">
              <UserForm editingUSer={editingUser} onSuccess={handleFormSuccess} />
            </Modal.Body>
           
       </Modal>
    </div>
  );
};

export default UsersList;
