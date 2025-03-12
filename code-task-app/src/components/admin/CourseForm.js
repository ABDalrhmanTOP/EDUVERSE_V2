import React, { useEffect, useState } from 'react';
import axios from '../../api/axios.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CourseForm = ({ editingCourse, onSuccess }) => {
  const [video_id, setVideo_ID] = useState('');
  const [name, setname] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (editingCourse) {
      setVideo_ID(editingCourse.video_id);
      setname(editingCourse.name);
      setDescription(editingCourse.description);
    } else {
      setname('');
      setVideo_ID('');
      setDescription('');
    }
  }, [editingCourse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { 
      video_id, 
      name, 
      description
    };

    if (editingCourse) {
      // Update existing course
      axios.put(`/courses/${editingCourse.id}`, data)
        .then(response => onSuccess())
        .catch(error => console.error('Error updating course:', error));
    } else {
      // Add new course
      axios.post('/courses', data)
        .then(response => onSuccess())
        .catch(error => console.error('Error adding course:', error));
    }
  };


  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
        <div className="d-flex justify-content-between">
          <h3 className="text-center mb-4">{editingCourse ? 'Update Course' : 'Add Course'}</h3>
        </div>

        <div className="mb-3">
          <label htmlFor="video_id" className="form-label">Video Title</label>
          <input 
            id="video_id" 
            type="text" 
            className="form-control" 
            value={video_id} 
            onChange={e => setVideo_ID(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Course Name</label>
          <input 
            id="name" 
            type="text" 
            className="form-control" 
            value={name} 
            onChange={e => setname(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea 
            id="description" 
            className="form-control" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows="4" 
          />
        </div>

        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary">
            {editingCourse ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
