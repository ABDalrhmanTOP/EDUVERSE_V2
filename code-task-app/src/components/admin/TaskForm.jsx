import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaSave, FaTimes, FaPlus, FaTrash, FaChevronUp, FaChevronDown } from 'react-icons/fa';
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
  const { t, i18n } = useTranslation();
  
  // Always use multi-task state, start with one (or prefill if editing)
  const initialTask = task ? {
    title: task.title || '',
    description: task.description || task.prompt || '', // Use prompt as description if description is empty
    type: task.type || 'mcq',
    timestamp: task.timestamp || '',
    points: task.points || 1,
    question: task.question || task.prompt || '', // Use prompt for question text
    options: Array.isArray(task.options) ? task.options : (task.options ? JSON.parse(task.options) : ['', '', '', '']),
    correct_answer: task.expected_output || 0, // Use expected_output for MCQ
    tf_question: task.tf_question || task.prompt || '', // Use prompt for True/False question
    tf_answer: task.expected_output === 'true' ? true : (task.expected_output === 'false' ? false : true), // Use expected_output for True/False
    coding_question: task.coding_question || task.prompt || '', // Use prompt for coding question
    coding_test_cases: Array.isArray(task.coding_test_cases) ? task.coding_test_cases : (task.coding_test_cases ? JSON.parse(task.coding_test_cases) : [{ input: '', output: '', description: '' }]),
    coding_solution: task.expected_output || '', // Use expected_output for coding
    coding_language: task.coding_language || 'javascript',
    syntax_hint: task.syntax_hint || '', // Add syntax_hint field
    course_id: task.playlist_id || task.course_id || courseId || ''
  } : {
    title: '',
    description: '',
    type: 'mcq',
    timestamp: '',
    points: 1,
    question: '',
    options: { 'A': '', 'B': '', 'C': '', 'D': '' },
    correct_answer: 'A',
    tf_question: '',
    tf_answer: true,
    coding_question: '',
    coding_test_cases: [{ input: '', output: '', description: '' }],
    coding_solution: '',
    coding_language: 'javascript',
    syntax_hint: '',
    course_id: courseId || ''
  };
  const [tasks, setTasks] = useState([initialTask]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Update form when task prop changes (for editing)
  useEffect(() => {
    if (task) {
      console.log('Task prop changed:', task); // Debug log
      const updatedTask = {
        title: task.title || '',
        description: task.description || task.prompt || '',
        type: task.type || 'mcq',
        timestamp: task.timestamp || '',
        points: task.points || 1,
        question: task.question || task.prompt || '',
        options: Array.isArray(task.options) ? task.options : (task.options ? JSON.parse(task.options) : ['', '', '', '']),
        correct_answer: task.expected_output || 0, // For MCQ, this should be the option key (like "A")
        tf_question: task.tf_question || task.prompt || '',
        tf_answer: task.expected_output === 'true' ? true : (task.expected_output === 'false' ? false : true),
        coding_question: task.coding_question || task.prompt || '',
        coding_test_cases: Array.isArray(task.coding_test_cases) ? task.coding_test_cases : (task.coding_test_cases ? JSON.parse(task.coding_test_cases) : [{ input: '', output: '', description: '' }]),
        coding_solution: task.expected_output || '',
        coding_language: task.coding_language || 'javascript',
        syntax_hint: task.syntax_hint || '',
        course_id: task.playlist_id || task.course_id || courseId || ''
      };
      console.log('Updated task state:', updatedTask); // Debug log
      setTasks([updatedTask]);
    }
  }, [task, courseId]);

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

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await axios.get('/admin/courses');
        setCourses(response.data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setError('Failed to load courses. Please try again.');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

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

  const handleOptionChange = (taskIdx, optionKey, value) => {
    setTasks(prev => prev.map((t, i) => {
      if (i === taskIdx) {
        const options = Array.isArray(t.options) ? t.options : (t.options ? JSON.parse(t.options) : {});
        options[optionKey] = value;
        return { ...t, options };
      }
      return t;
    }));
  };

  const addOption = (taskIdx) => {
    setTasks(prev => prev.map((t, i) => {
      if (i === taskIdx) {
        const options = Array.isArray(t.options) ? t.options : (t.options ? JSON.parse(t.options) : {});
        const optionKeys = Object.keys(options);
        const nextKey = String.fromCharCode(65 + optionKeys.length); // A, B, C, D, etc.
        options[nextKey] = '';
        return { ...t, options };
      }
      return t;
    }));
  };

  const removeOption = (taskIdx, optionKey) => {
    setTasks(prev => prev.map((t, i) => {
      if (i === taskIdx) {
        const options = Array.isArray(t.options) ? t.options : (t.options ? JSON.parse(t.options) : {});
        const optionKeys = Object.keys(options);
        
        if (optionKeys.length <= 2) {
          setError(t('admin.tasks.mcqMustHaveAtLeast2Options'));
          return t;
        }
        
        delete options[optionKey];
        // If the removed option was the correct answer, reset to first available option
        const newCorrectAnswer = t.correct_answer === optionKey ? Object.keys(options)[0] : t.correct_answer;
        
        setError('');
        return { ...t, options, correct_answer: newCorrectAnswer };
      }
      return t;
    }));
  };

  const handleTestCaseChange = (taskIdx, testCaseIdx, field, value) => {
    setTasks(prev => prev.map((t, i) =>
      i === taskIdx ? { ...t, coding_test_cases: t.coding_test_cases.map((tc, i) => i === testCaseIdx ? { ...tc, [field]: value } : tc) } : t
    ));
  };

  const addTestCase = (taskIdx) => {
    setTasks(prev => prev.map((t, i) =>
      i === taskIdx ? { ...t, coding_test_cases: [...t.coding_test_cases, { input: '', output: '', description: '' }] } : t
    ));
  };

  const removeTestCase = (taskIdx, testCaseIdx) => {
    setTasks(prev => prev.map((t, i) =>
      i === taskIdx ? { ...t, coding_test_cases: t.coding_test_cases.filter((_, i) => i !== testCaseIdx) } : t
    ));
  };

  // Handlers for multi-task
  const handleTaskChange = (idx, field, value) => {
    console.log('handleTaskChange called:', { idx, field, value }); // Debug log
    const updated = [...tasks];
    
    // If changing task type, reset type-specific fields
    if (field === 'type') {
      const currentTask = updated[idx];
      if (value === 'mcq') {
        currentTask.question = '';
        currentTask.options = { 'A': '', 'B': '', 'C': '', 'D': '' };
        currentTask.correct_answer = 'A';
        currentTask.tf_question = '';
        currentTask.tf_answer = true;
        currentTask.coding_question = '';
        currentTask.coding_test_cases = [{ input: '', output: '', description: '' }];
        currentTask.coding_solution = '';
        currentTask.coding_language = 'javascript';
      } else if (value === 'truefalse') {
        currentTask.question = '';
        currentTask.options = { 'A': '', 'B': '', 'C': '', 'D': '' };
        currentTask.correct_answer = 'A';
        currentTask.tf_question = '';
        currentTask.tf_answer = true;
        currentTask.coding_question = '';
        currentTask.coding_test_cases = [{ input: '', output: '', description: '' }];
        currentTask.coding_solution = '';
        currentTask.coding_language = 'javascript';
      } else if (value === 'code') {
        currentTask.question = '';
        currentTask.options = { 'A': '', 'B': '', 'C': '', 'D': '' };
        currentTask.correct_answer = 'A';
        currentTask.tf_question = '';
        currentTask.tf_answer = true;
        currentTask.coding_question = '';
        currentTask.coding_test_cases = [{ input: '', output: '', description: '' }];
        currentTask.coding_solution = '';
        currentTask.coding_language = 'javascript';
      }
    }
    
    updated[idx][field] = value;
    console.log('Updated tasks:', updated); // Debug log
    setTasks(updated);
  };
  const handleAddTask = () => {
    setTasks([...tasks, {
      title: '', description: '', type: 'mcq', timestamp: '', points: 1,
      question: '', options: { 'A': '', 'B': '', 'C': '', 'D': '' }, correct_answer: 'A',
      tf_question: '', tf_answer: true,
      coding_question: '', coding_test_cases: [{ input: '', output: '', description: '' }],
      coding_solution: '', coding_language: 'javascript',
      syntax_hint: '',
      course_id: courseId || ''
    }]);
  };
  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  // TimestampInput Component
  const TimestampInput = ({ value, onChange, placeholder = "00:00:00" }) => {
    // Handle undefined, null, or empty values
    const safeValue = value || "00:00:00";
    const [hours, minutes, seconds] = safeValue.split(':').map(Number);
    
    const updateParent = (h, m, s) => {
      const newValue = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      onChange(newValue);
    };

    const increment = (type) => {
      switch (type) {
        case 'hours':
          updateParent((hours + 1) % 24, minutes, seconds);
          break;
        case 'minutes':
          updateParent(hours, (minutes + 1) % 60, seconds);
          break;
        case 'seconds':
          updateParent(hours, minutes, (seconds + 1) % 60);
          break;
      }
    };

    const decrement = (type) => {
      switch (type) {
        case 'hours':
          updateParent((hours - 1 + 24) % 24, minutes, seconds);
          break;
        case 'minutes':
          updateParent(hours, (minutes - 1 + 60) % 60, seconds);
          break;
        case 'seconds':
          updateParent(hours, minutes, (seconds - 1 + 60) % 60);
          break;
      }
    };

    const handleInputChange = (type, newValue) => {
      const numValue = parseInt(newValue) || 0;
      let clampedValue = numValue;
      
      switch (type) {
        case 'hours':
          clampedValue = Math.max(0, Math.min(23, numValue));
          updateParent(clampedValue, minutes, seconds);
          break;
        case 'minutes':
        case 'seconds':
          clampedValue = Math.max(0, Math.min(59, numValue));
          if (type === 'minutes') {
            updateParent(hours, clampedValue, seconds);
          } else {
            updateParent(hours, minutes, clampedValue);
          }
          break;
      }
    };

    return (
      <div className="timestamp-input-container">
        <div className="timestamp-input-group">
          <button
            type="button"
            className="timestamp-btn timestamp-up"
            onClick={() => increment('hours')}
          >
            <FaChevronUp />
          </button>
          <input
            type="number"
            min="0"
            max="23"
            value={hours.toString().padStart(2, '0')}
            onChange={(e) => handleInputChange('hours', e.target.value)}
            className="timestamp-input"
          />
          <button
            type="button"
            className="timestamp-btn timestamp-down"
            onClick={() => decrement('hours')}
          >
            <FaChevronDown />
          </button>
        </div>
        
        <span className="timestamp-separator">:</span>
        
        <div className="timestamp-input-group">
          <button
            type="button"
            className="timestamp-btn timestamp-up"
            onClick={() => increment('minutes')}
          >
            <FaChevronUp />
          </button>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes.toString().padStart(2, '0')}
            onChange={(e) => handleInputChange('minutes', e.target.value)}
            className="timestamp-input"
          />
          <button
            type="button"
            className="timestamp-btn timestamp-down"
            onClick={() => decrement('minutes')}
          >
            <FaChevronDown />
          </button>
        </div>
        
        <span className="timestamp-separator">:</span>
        
        <div className="timestamp-input-group">
          <button
            type="button"
            className="timestamp-btn timestamp-up"
            onClick={() => increment('seconds')}
          >
            <FaChevronUp />
          </button>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds.toString().padStart(2, '0')}
            onChange={(e) => handleInputChange('seconds', e.target.value)}
            className="timestamp-input"
          />
          <button
            type="button"
            className="timestamp-btn timestamp-down"
            onClick={() => decrement('seconds')}
          >
            <FaChevronDown />
          </button>
        </div>
      </div>
    );
  };

  // Validation and submit
  const validateTask = (task) => {
    if (!task.title.trim()) return t('admin.tasks.taskTitleRequired');
    if (!task.course_id) return 'Please select a course for this task';
    switch (task.type) {
      case 'mcq':
        if (!task.question.trim()) return t('admin.tasks.questionRequiredForMCQ');
        if (task.options.some(opt => !opt.trim())) return t('admin.tasks.allMCQOptionsMustBeFilled');
        break;
      case 'truefalse':
        if (!task.tf_question.trim()) return t('admin.tasks.questionRequiredForTrueFalse');
        break;
      case 'code':
        if (!task.coding_question.trim()) return t('admin.tasks.questionRequiredForCoding');
        if (task.coding_test_cases.some(tc => !tc.input.trim() || !tc.output.trim())) return t('admin.tasks.allTestCasesMustHaveInputAndOutput');
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
      // Extra validation for true/false
      if (t.type === 'truefalse' && typeof t.tf_answer !== 'boolean') {
        setError('Please select True or False as the answer.');
        return;
      }
    }
    setLoading(true);
    try {
      // Map course_id to playlist_id for backend compatibility and format data properly
      const tasksWithPlaylistId = tasks.map(task => {
        // Start with basic task data
        const formattedTask = {
          playlist_id: task.course_id, // Map course_id to playlist_id
          video_id: String(task.course_id || '1'), // Convert to string as backend expects
          timestamp: task.timestamp || '00:00:00', // Ensure timestamp is set
          title: task.title,
          description: task.description || '', // Include description
          type: task.type,
          prompt: task.title, // Use title as prompt (required field)
          expected_output: null, // Set to null for now
          syntax_hint: task.syntax_hint || '', // Use syntax_hint from form
          points: task.points || 1 // Include points
        };

        // Add type-specific fields
        if (task.type === 'mcq') {
          formattedTask.question = task.question;
          formattedTask.correct_answer = String(task.correct_answer); // Always send as string
          // For MCQ, expected_output should be the correct option key (like "A")
          formattedTask.expected_output = String(task.correct_answer);
          // Convert options to JSON if it's an object
          if (typeof task.options === 'object' && !Array.isArray(task.options)) {
            formattedTask.options = JSON.stringify(task.options);
          }
        } else if (task.type === 'truefalse') {
          formattedTask.tf_question = task.tf_question;
          formattedTask.correct_answer = task.tf_answer ? 'true' : 'false'; // Always lowercase string
          formattedTask.expected_output = task.tf_answer ? 'true' : 'false'; // Always lowercase string
        } else if (task.type === 'code') {
          formattedTask.coding_question = task.coding_question;
          formattedTask.coding_language = task.coding_language;
          formattedTask.coding_solution = task.coding_solution || '';
          formattedTask.expected_output = task.coding_solution || ''; // Save solution as expected_output for coding component
          // Only include coding_test_cases if it's an array and convert to JSON
          if (Array.isArray(task.coding_test_cases)) {
            formattedTask.coding_test_cases = JSON.stringify(task.coding_test_cases);
          }
        }

        console.log('Formatted task data:', formattedTask); // Debug log
        return formattedTask;
      });

      // If editing, update the task
      if (isEditing && task) {
        // For updates, we don't need to send video_id if it's not changing
        const updateData = { ...tasksWithPlaylistId[0] };
        delete updateData.video_id; // Remove video_id from update to avoid validation issues
        const response = await axios.put(`/admin/tasks/${task.id}`, updateData);
        onSave(response.data);
      } else {
        // Create new tasks
        const savedTasks = [];
        for (const taskData of tasksWithPlaylistId) {
          const response = await axios.post('/admin/tasks', taskData);
          savedTasks.push(response.data);
        }
        onSave(savedTasks.length === 1 ? savedTasks[0] : savedTasks);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      console.error('Error response:', err.response?.data); // Debug log
      setError(err.response?.data?.message || t('admin.tasks.errorSavingTasks'));
    } finally {
      setLoading(false);
    }
  };

  const renderMCQFields = (task, taskIdx) => (
    <div className="task-type-fields mcq-fields">
      <div className="form-group">
        <label>{t('admin.tasks.mcqQuestion')} *</label>
        <input
          type="text"
          value={task.question}
          onChange={(e) => handleTaskChange(taskIdx, 'question', e.target.value)}
          placeholder={t('admin.tasks.enterMCQQuestion')}
          required
        />
      </div>
      <div className="mcq-options-list">
        {(() => {
          const options = Array.isArray(task.options) ? task.options : (task.options ? JSON.parse(task.options) : {});
          const optionKeys = Object.keys(options);
          return optionKeys.map((key, idx) => (
            <div className="mcq-option-card" key={key}>
              <input
                type="radio"
                name={`correct_answer_${taskIdx}`}
                value={key}
                checked={task.correct_answer === key}
                onChange={(e) => handleTaskChange(taskIdx, 'correct_answer', e.target.value)}
                className="mcq-correct-radio"
              />
              <input
                type="text"
                value={options[key]}
                onChange={(e) => handleOptionChange(taskIdx, key, e.target.value)}
                placeholder={t('admin.tasks.enterOption')}
                className="mcq-option-input"
                required
              />
              {optionKeys.length > 2 && (
                <button
                  type="button"
                  className="remove-option-btn"
                  onClick={() => removeOption(taskIdx, key)}
                  title={t('admin.tasks.removeOption')}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ));
        })()}
        <button
          type="button"
          className="add-option-btn"
          onClick={() => addOption(taskIdx)}
        >
          <FaPlus /> {t('admin.tasks.addOption')}
        </button>
      </div>
    </div>
  );

  const renderTrueFalseFields = (task, taskIdx) => {
    console.log('Rendering True/False fields for task:', taskIdx, 'tf_answer:', task.tf_answer); // Debug log
    return (
      <div className="task-type-fields tf-fields">
        <div className="form-group">
          <label>{t('admin.tasks.trueFalseQuestion')} *</label>
          <input
            type="text"
            value={task.tf_question}
            onChange={(e) => handleTaskChange(taskIdx, 'tf_question', e.target.value)}
            placeholder={t('admin.tasks.enterTrueFalseQuestion')}
            required
          />
        </div>
        <div className="radio-group tf-radio-group">
          <label>
            <input
              type="radio"
              name={`tf_answer_${taskIdx}`}
              checked={task.tf_answer === true}
              onChange={() => handleTaskChange(taskIdx, 'tf_answer', true)}
            />
            {t('admin.tasks.true')}
          </label>
          <label>
            <input
              type="radio"
              name={`tf_answer_${taskIdx}`}
              checked={task.tf_answer === false}
              onChange={() => handleTaskChange(taskIdx, 'tf_answer', false)}
            />
            {t('admin.tasks.false')}
          </label>
        </div>
      </div>
    );
  };

  const renderCodingFields = (task, taskIdx) => (
    <div className="task-type-fields coding-fields">
      <div className="form-group">
        <label>{t('admin.tasks.codingQuestion')} *</label>
        <input
          type="text"
          value={task.coding_question}
          onChange={(e) => handleTaskChange(taskIdx, 'coding_question', e.target.value)}
          placeholder={t('admin.tasks.enterCodingQuestion')}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('admin.tasks.programmingLanguage')} *</label>
        <select
          value={task.coding_language}
          onChange={(e) => handleTaskChange(taskIdx, 'coding_language', e.target.value)}
          required
        >
          {languageOptions.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>{t('admin.tasks.codingSolution')} ({t('common.optional')})</label>
        <textarea
          value={task.coding_solution}
          onChange={(e) => handleTaskChange(taskIdx, 'coding_solution', e.target.value)}
          placeholder={t('admin.tasks.enterCodingSolution')}
        />
      </div>
      <div className="coding-test-cases-list">
        <label style={{fontWeight:600,marginBottom:'0.5rem'}}>{t('admin.tasks.testCases')}</label>
        {(Array.isArray(task.coding_test_cases) ? task.coding_test_cases : [{ input: '', output: '', description: '' }]).map((tc, idx) => (
          <div className="test-case-card" key={idx}>
            <input
              type="text"
              value={tc.input}
              onChange={(e) => handleTestCaseChange(taskIdx, idx, 'input', e.target.value)}
              placeholder={t('admin.tasks.input')}
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.output}
              onChange={(e) => handleTestCaseChange(taskIdx, idx, 'output', e.target.value)}
              placeholder={t('admin.tasks.output')}
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.description}
              onChange={(e) => handleTestCaseChange(taskIdx, idx, 'description', e.target.value)}
              placeholder={t('admin.tasks.testCaseDescription')}
              className="test-case-input"
            />
            {(Array.isArray(task.coding_test_cases) ? task.coding_test_cases : [{ input: '', output: '', description: '' }]).length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeTestCase(taskIdx, idx)}
                title={t('admin.tasks.removeTestCase')}
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="add-test-case-btn"
          onClick={() => addTestCase(taskIdx)}
        >
          <FaPlus /> {t('admin.tasks.addTestCase')}
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
              {tasks.length > 1 ? t('admin.tasks.addTask') : isEditing ? t('admin.tasks.editTask') : t('admin.tasks.createTask')}
            </h2>
            <button
              className="task-form-close-btn"
              onClick={onCancel}
              type="button"
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="multi-task-form" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            {error && <div className="error-message">{error}</div>}
            {tasks.map((taskItem, idx) => (
              <div className="multi-task-card" key={idx}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <span style={{fontWeight:700,fontSize:'1.1rem',color:'#b8860b'}}>{t('admin.tasks.task')} {idx+1}</span>
                  {tasks.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => handleRemoveTask(idx)} title={t('admin.tasks.removeTask')}><FaTrash /></button>
                  )}
                </div>
                <div className="form-group">
                  <label>{t('admin.tasks.taskTitle')} *</label>
                  <input
                    type="text"
                    value={taskItem.title}
                    onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                    placeholder={t('admin.tasks.enterTaskTitle')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin.tasks.course')} *</label>
                  <select
                    value={taskItem.course_id}
                    onChange={(e) => handleTaskChange(idx, 'course_id', e.target.value)}
                    required
                    disabled={coursesLoading}
                  >
                    <option value="">{coursesLoading ? 'Loading courses...' : 'Select a course'}</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.tasks.taskType')} *</label>
                  <select
                    value={taskItem.type}
                    onChange={(e) => handleTaskChange(idx, 'type', e.target.value)}
                    required
                  >
                    <option value="mcq">{t('admin.tasks.multipleChoice')}</option>
                    <option value="truefalse">{t('admin.tasks.trueFalse')}</option>
                    <option value="code">{t('admin.tasks.coding')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.tasks.taskDescription')}</label>
                  <textarea
                    value={taskItem.description}
                    onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                    placeholder={t('admin.tasks.enterTaskDescription')}
                  />
                </div>
                <div className="form-group">
                  <label>Syntax Hint (Optional)</label>
                  <textarea
                    value={taskItem.syntax_hint}
                    onChange={(e) => handleTaskChange(idx, 'syntax_hint', e.target.value)}
                    placeholder="Enter syntax hint or helpful information..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.tasks.timestamp')} {t('admin.tasks.timestampFormat')}</label>
                    <TimestampInput
                      value={taskItem.timestamp}
                      onChange={(value) => handleTaskChange(idx, 'timestamp', value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.tasks.points')}</label>
                    <input
                      type="number"
                      value={taskItem.points}
                      onChange={(e) => handleTaskChange(idx, 'points', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                {/* Task Type Specific Fields */}
                {taskItem.type === 'mcq' && renderMCQFields(taskItem, idx)}
                {taskItem.type === 'truefalse' && renderTrueFalseFields(taskItem, idx)}
                {taskItem.type === 'code' && renderCodingFields(taskItem, idx)}
              </div>
            ))}
            <button type="button" className="multi-task-btn" onClick={handleAddTask}><FaPlus /> {t('admin.tasks.addAnotherTask')}</button>
            <div className="form-actions">
              <button type="button" onClick={onCancel} className="cancel-btn">{t('common.cancel')}</button>
              <button type="submit" className="save-btn" disabled={loading}>
                <FaSave className={loading ? 'spinning' : ''} /> {loading ? t('common.saving') : (tasks.length > 1 ? t('admin.tasks.saveTasks') : isEditing ? t('common.update') : t('admin.tasks.saveTask'))}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskForm;