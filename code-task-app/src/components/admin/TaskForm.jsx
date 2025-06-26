import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import axios from '../../api/axios';
import '../../styles/admin/TaskForm.css';

const TaskForm = ({ 
  task = null, 
  courseId, 
  onSave, 
  onCancel, 
  isEditing = false, 
  wide = false 
}) => {
  // Always use multi-task state, start with one (or prefill if editing)
  const initialTask = task ? {
    title: task.title || '',
    description: task.description || '',
    type: task.type || 'mcq',
    timestamp: task.timestamp || '',
    points: task.points || 1,
    question: task.question || '',
    options: task.options || ['', '', '', ''],
    correct_answer: task.correct_answer || 0,
    tf_question: task.tf_question || '',
    tf_answer: task.tf_answer !== undefined ? task.tf_answer : true,
    coding_question: task.coding_question || '',
    coding_test_cases: task.coding_test_cases || [{ input: '', output: '', description: '' }],
    coding_solution: task.coding_solution || '',
    coding_language: task.coding_language || 'javascript'
  } : {
    title: '',
    description: '',
    type: 'mcq',
    timestamp: '',
    points: 1,
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    tf_question: '',
    tf_answer: true,
    coding_question: '',
    coding_test_cases: [{ input: '', output: '', description: '' }],
    coding_solution: '',
    coding_language: 'javascript'
  };
  const [tasks, setTasks] = useState([initialTask]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'php', label: 'PHP' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' },
    { value: 'rust', label: 'Rust' },
  ];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleInputChange = (field, value) => {
    setTasks(prev => prev.map(t => ({ ...t, [field]: value })));
  };

  const handleOptionChange = (idx, value) => {
    setTasks(prev => prev.map((t, i) =>
      i === idx ? { ...t, options: [...t.options.slice(0, idx), value, ...t.options.slice(idx + 1)] } : t
    ));
  };

  const addOption = (idx) => {
    setTasks(prev => prev.map((t, i) =>
      i === idx ? { ...t, options: [...t.options, ''] } : t
    ));
  };

  const removeOption = (idx) => {
    if (tasks[idx].options.length <= 2) {
      setError('MCQ must have at least 2 options');
      return;
    }
    
    setTasks(prev => prev.map((t, i) =>
      i === idx ? { ...t, options: t.options.filter((_, i) => i !== idx), correct_answer: t.correct_answer >= idx ? Math.max(0, t.correct_answer - 1) : t.correct_answer } : t
    ));
    setError('');
  };

  const handleTestCaseChange = (idx, field, value) => {
    setTasks(prev => prev.map((t, i) =>
      i === idx ? { ...t, coding_test_cases: t.coding_test_cases.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc) } : t
    ));
  };

  const addTestCase = (idx) => {
    setTasks(prev => prev.map((t, i) =>
      i === idx ? { ...t, coding_test_cases: [...t.coding_test_cases, { input: '', output: '', description: '' }] } : t
    ));
  };

  const removeTestCase = (idx) => {
    setTasks(prev => prev.map((t, i) =>
      i === idx ? { ...t, coding_test_cases: t.coding_test_cases.filter((_, i) => i !== idx) } : t
    ));
  };

  // Handlers for multi-task
  const handleTaskChange = (idx, field, value) => {
    const updated = [...tasks];
    updated[idx][field] = value;
    setTasks(updated);
  };
  const handleAddTask = () => {
    setTasks([...tasks, {
      title: '', description: '', type: 'mcq', timestamp: '', points: 1,
      question: '', options: ['', '', '', ''], correct_answer: 0,
      tf_question: '', tf_answer: true,
      coding_question: '', coding_test_cases: [{ input: '', output: '', description: '' }],
      coding_solution: '', coding_language: 'javascript'
    }]);
  };
  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  // Validation and submit
  const validateTask = (task) => {
    if (!task.title.trim()) return 'Task title is required';
    switch (task.type) {
      case 'mcq':
        if (!task.question.trim()) return 'Question is required for MCQ';
        if (task.options.some(opt => !opt.trim())) return 'All MCQ options must be filled';
        break;
      case 'true_false':
        if (!task.tf_question.trim()) return 'Question is required for True/False';
        break;
      case 'CODE':
        if (!task.coding_question.trim()) return 'Question is required for Coding task';
        if (task.coding_test_cases.some(tc => !tc.input.trim() || !tc.output.trim())) return 'All test cases must have input and output';
        break;
    }
    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    for (let t of tasks) {
      const err = validateTask(t);
      if (err) { setError(err); return; }
    }
    setLoading(true);
    try {
      await onSave(tasks);
    } catch (err) {
      setError('Error saving tasks');
    } finally {
      setLoading(false);
    }
  };

  const renderMCQFields = (task) => (
    <div className="task-type-fields mcq-fields">
      <div className="form-group">
        <label>MCQ Question *</label>
        <input
          type="text"
          value={task.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
          placeholder="Enter MCQ question..."
          required
        />
      </div>
      <div className="mcq-options-list">
        {task.options.map((option, idx) => (
          <div className="mcq-option-card" key={idx}>
            <input
              type="radio"
              name="correct_answer"
              checked={task.correct_answer === idx}
              onChange={(e) => handleInputChange('correct_answer', parseInt(e.target.value))}
              className="mcq-correct-radio"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="mcq-option-input"
              required
            />
            {task.options.length > 2 && (
              <button
                type="button"
                className="remove-option-btn"
                onClick={() => removeOption(idx)}
                title="Remove Option"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="add-option-btn"
          onClick={() => addOption(tasks.indexOf(task))}
        >
          <FaPlus /> Add Option
        </button>
      </div>
    </div>
  );

  const renderTrueFalseFields = (task) => (
    <div className="task-type-fields tf-fields">
      <div className="form-group">
        <label>True/False Question *</label>
        <input
          type="text"
          value={task.tf_question}
          onChange={(e) => handleInputChange('tf_question', e.target.value)}
          placeholder="Enter True/False question..."
          required
        />
      </div>
      <div className="radio-group tf-radio-group">
        <label>
          <input
            type="radio"
            name="tf_answer"
            checked={task.tf_answer === true}
            onChange={(e) => handleInputChange('tf_answer', true)}
          />
          True
        </label>
        <label>
          <input
            type="radio"
            name="tf_answer"
            checked={task.tf_answer === false}
            onChange={(e) => handleInputChange('tf_answer', false)}
          />
          False
        </label>
      </div>
    </div>
  );

  const renderCodingFields = (task) => (
    <div className="task-type-fields coding-fields">
      <div className="form-group">
        <label>Coding Question *</label>
        <input
          type="text"
          value={task.coding_question}
          onChange={(e) => handleInputChange('coding_question', e.target.value)}
          placeholder="Enter coding question..."
          required
        />
      </div>
      <div className="form-group">
        <label>Programming Language *</label>
        <select
          value={task.coding_language}
          onChange={(e) => handleInputChange('coding_language', e.target.value)}
          required
        >
          {languageOptions.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Solution (optional)</label>
        <textarea
          value={task.coding_solution}
          onChange={(e) => handleInputChange('coding_solution', e.target.value)}
          placeholder="Enter reference solution (optional)..."
        />
      </div>
      <div className="coding-test-cases-list">
        <label style={{fontWeight:600,marginBottom:'0.5rem'}}>Test Cases</label>
        {task.coding_test_cases.map((tc, idx) => (
          <div className="test-case-card" key={idx}>
            <input
              type="text"
              value={tc.input}
              onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
              placeholder="Input"
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.output}
              onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
              placeholder="Expected Output"
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.description}
              onChange={(e) => handleTestCaseChange(idx, 'description', e.target.value)}
              placeholder="Description (optional)"
              className="test-case-input"
            />
            {task.coding_test_cases.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeTestCase(idx)}
                title="Remove Test Case"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="add-test-case-btn"
          onClick={() => addTestCase(tasks.indexOf(task))}
        >
          <FaPlus /> Add Test Case
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.4, 0.2, 0.6, 1] }}
        className={`task-form-overlay`}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0.2, 0.6, 1] }}
          className={`task-form-container${wide ? ' wide' : ''}`}
        >
          <div className="task-form-header">
            <h2 className="task-form-title">
              <FaPlus className="task-form-icon" />
              {tasks.length > 1 ? 'Add Multiple Tasks' : isEditing ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              className="task-form-close-btn"
              onClick={onCancel}
              type="button"
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="multi-task-form">
            {error && <div className="error-message">{error}</div>}
            {tasks.map((t, idx) => (
              <div className="multi-task-card" key={idx}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <span style={{fontWeight:700,fontSize:'1.1rem',color:'#b8860b'}}>Task {idx+1}</span>
                  {tasks.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => handleRemoveTask(idx)}><FaTrash /></button>
                  )}
                </div>
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Task Type *</label>
                  <select
                    value={t.type}
                    onChange={(e) => handleTaskChange(idx, 'type', e.target.value)}
                    required
                  >
                    <option value="mcq">MCQ</option>
                    <option value="true_false">True/False</option>
                    <option value="CODE">Coding</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={t.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Video Timestamp (mm:ss)</label>
                    <input
                      type="text"
                      value={t.timestamp}
                      onChange={(e) => handleInputChange('timestamp', e.target.value)}
                      placeholder="e.g., 05:30"
                    />
                  </div>
                  <div className="form-group">
                    <label>Points</label>
                    <input
                      type="number"
                      value={t.points}
                      onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                {/* Task Type Specific Fields */}
                {t.type === 'mcq' && renderMCQFields(t)}
                {t.type === 'true_false' && renderTrueFalseFields(t)}
                {t.type === 'CODE' && renderCodingFields(t)}
              </div>
            ))}
            <button type="button" className="multi-task-btn" onClick={handleAddTask}><FaPlus /> Add Another Task</button>
            <div className="form-actions">
              <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
              <button type="submit" className="save-btn" disabled={loading}>
                <FaSave className={loading ? 'spinning' : ''} /> {loading ? 'Saving...' : (tasks.length > 1 ? 'Save All' : isEditing ? 'Save Changes' : 'Save Task')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskForm;