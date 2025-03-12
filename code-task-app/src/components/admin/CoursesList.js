import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import CourseForm from './CourseForm';
import { Modal, Button } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);

  const fetchCourses = () => {
    axios.get('/courses')
      .then(response => {
        setCourses(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('An error occurred while fetching data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = (id) => {
    axios.delete(`/courses/${id}`)
      .then(() => fetchCourses())
      .catch(error => console.error('Error deleting course:', error));
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleFormSuccess = () => {
    setEditingCourse(null);
    setShowCourseForm(false);
    fetchCourses();
  };
  
  return (
    <div className="container my-4 p-4 bg-light rounded shadow">
      <h2 className="mb-4 text-center text-primary">Course Management</h2>

      <div className="text-center mb-3">
        <Button variant="success" onClick={() => { setEditingCourse(null); setShowCourseForm(true); }}>
          <FaPlus className="me-2" /> Add New Course
        </Button>
      </div>

      {loading ? (
        <div className="alert alert-info mt-3 text-center">Loading data...</div>
      ) : error ? (
        <div className="alert alert-danger mt-3 text-center">{error}</div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-striped table-hover table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Video Title</th>
                <th>Title</th>
                <th>Description</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.video_id}</td>
                  <td>{course.name}</td>
                  <td>{course.description}</td>
                  <td className="text-center">
                    <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(course)}>
                      <FaEdit />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(course.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal لإضافة/تعديل الكورس */}
      <Modal show={showCourseForm} onHide={() => setShowCourseForm(false)} centered backdrop="static">
        <Modal.Header closeButton />
        <Modal.Body>
          <CourseForm editingCourse={editingCourse} onSuccess={handleFormSuccess} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CoursesList;
