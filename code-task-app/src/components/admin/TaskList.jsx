import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import TaskForm from './TaskForm';
import { Modal } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import { FaEdit, FaTrash } from 'react-icons/fa';

const TaskList = () => {
  const { course_id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/${course_id}`);
      setTasks(response.data);
      setError('');
    } catch (error) {
      console.error("Error fetching tasks", error);
      setError("Failed to fetch tasks. Please try again.");
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    console.log(course_id)
  }, [course_id]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks(); // إعادة تحميل المهام بعد الحذف
      } catch (err) {
        console.error(err);
        setError('Error deleting task');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchTasks(); 
  };

  return (
    <div className="container my-4 p-4 rounded shadow" style={{ backgroundColor: '#EAE0D5' }}>
      <h2 className="mb-4 text-center" style={{ color: '#5D3A00' }}>Task Management</h2>
      <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="btn btn-success mb-3" style={{ backgroundColor: '#6B705C', borderColor: '#6B705C', color: '#ffffff' }}>+ Add Task</button>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover table-striped table-bordered text-center">
          <thead >
            <tr style={{ Color: '#A98467', borderColor: '#6B705C', backgroundColor: '#6B705C',}}>
              <th>ID</th>
              <th>Title</th>
              <th>Timestamp</th>
              <th>Type</th>
              <th>Prompt</th>
              <th>Expected Output</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan="7" className="text-muted">No tasks found</td></tr>
            ) : (
              tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>{task.timestamp}</td>
                  <td>{task.type}</td>
                  <td className="text-truncate" style={{ maxWidth: '250px' }}>{task.prompt}</td>
                  <td className="text-truncate" style={{ maxWidth: '150px' }}>{task.expected_output}</td>
                  <td>
                    <button className="btn btn-sm btn-info mx-1" style={{ backgroundColor: '#A98467', borderColor: '#A98467', color: '#fff' }} onClick={() => { setEditingTask(task); setShowForm(true); }}><FaEdit /></button>
                    <button className="btn btn-sm btn-danger mx-1" style={{ backgroundColor: '#BC4749', borderColor: '#BC4749', color: '#fff' }}   onClick={() => handleDelete(task.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered  backdrop="static" >
        <Modal.Header closeButton className=" text-white" style={{ backgroundColor: '#AD998A'}}>
          <Modal.Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="border-0" style={{ backgroundColor: '#AD998A'}}>
          <TaskForm
            editingTask={editingTask}
            courseId={course_id}
            onSuccess={handleFormSuccess}
            onClose={() => setShowForm(false)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TaskList;
