import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../../api/axios.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaSave, FaYoutube, FaTasks, FaTrash, FaExclamationTriangle, FaCode, FaListUl, FaCheckCircle, FaSpinner, FaChevronUp, FaChevronDown, FaCheck, FaClock, FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../../styles/admin/CourseForm.css';
import '../../styles/admin/TaskForm.css';

const CourseForm = ({ editingCourse, onSuccess, onClose }) => {
  const [video_id, setVideo_id] = useState('');
  const [videoDuration, setVideoDuration] = useState('00:10:00');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskError, setTaskError] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [existingCourses, setExistingCourses] = useState([]);
  const [showTaskSection, setShowTaskSection] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingDuration, setFetchingDuration] = useState(false);
  const [durationAutoFetched, setDurationAutoFetched] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [paid, setPaid] = useState(false);
  const { t, i18n } = useTranslation();

  // Real-time validation state
  const [videoValidation, setVideoValidation] = useState({
    isValid: false,
    isChecking: false,
    error: null,
    isDuplicate: false,
    duplicateCourse: null
  });

  // Add refs for all main fields
  const nameRef = useRef();
  const descriptionRef = useRef();
  const yearRef = useRef();
  const semesterRef = useRef();
  const videoIdRef = useRef();
  const videoDurationRef = useRef();
  const formErrorRef = useRef();
  const taskErrorRef = useRef();

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
    fetchExistingCourses();
    if (editingCourse) {
      populateFormData(editingCourse);
    }
    setIsInitialized(true);

    // Add ESC key listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [editingCourse, onClose]);

  useEffect(() => {
    setTaskError('');
  }, [tasks]);

  const fetchExistingCourses = async () => {
    try {
      const response = await apiClient.get('/admin/courses');
      setExistingCourses(response.data || []);
    } catch (error) {
      // Error fetching courses
    }
  };

  const populateFormData = (course) => {
    setName(course.name || '');
    setDescription(course.description || '');
    setYear(course.year?.toString() || '');
    setSemester(course.semester?.toString() || '');
    setVideo_id(course.video_id || '');
    setVideoDuration(course.video_duration || '00:10:00');
    
    // Ensure tasks have proper structure
    const processedTasks = (course.tasks || []).map(task => ({
      ...createEmptyTask(),
      ...task,
      options: Array.isArray(task.options) ? task.options : ['', '', '', ''],
      coding_test_cases: Array.isArray(task.coding_test_cases) ? task.coding_test_cases : [{ input: '', output: '', description: '' }]
    }));
    
    setTasks(processedTasks);
    setShowTaskSection(processedTasks.length > 0);
    setPaid(!!course.paid);
  };

  // Enhanced field validation
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) {
          errors.name = t('common.courseNameRequired');
        } else if (value.trim().length < 3) {
          errors.name = t('common.courseNameMinLength');
        } else {
          delete errors.name;
        }
        break;
      case 'description':
        if (!value || !value.trim()) {
          errors.description = t('common.descriptionRequired');
        } else if (value.trim().length < 10) {
          errors.description = t('common.descriptionMinLength');
        } else {
          delete errors.description;
        }
        break;
      case 'video_id':
        if (!value || !value.trim()) {
          errors.video_id = t('common.videoIdRequired');
        } else if (!/^[a-zA-Z0-9_-]{11}$/.test(value)) {
          errors.video_id = t('common.videoIdInvalid');
        } else {
          delete errors.video_id;
        }
        break;
      case 'videoDuration':
        if (!value || !value.trim()) {
          errors.videoDuration = t('common.durationRequired');
        } else if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
          errors.videoDuration = t('common.durationInvalid');
        } else {
          delete errors.videoDuration;
        }
        break;
      case 'year':
        if (!value || value === '') {
          errors.year = t('common.yearRequired');
        } else {
          delete errors.year;
        }
        break;
      case 'semester':
        if (!value || value === '') {
          errors.semester = t('common.semesterRequired');
        } else {
          delete errors.semester;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced task creation with full logic from TasksDashboard
  const createEmptyTask = () => ({
    title: '',
    description: '',
    type: 'mcq',
    timestamp: '00:00:00',
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
  });

  const handleAddTask = () => {
    setTasks([...tasks, createEmptyTask()]);
    setShowTaskSection(true);
  };

  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
    if (tasks.length === 1) {
      setShowTaskSection(false);
    }
  };

  // Enhanced task change handler
  const handleTaskChange = (idx, field, value) => {
    const updated = [...tasks];
      updated[idx][field] = value;
    setTasks(updated);
  };

  const handleOptionChange = (taskIdx, optionIdx, value) => {
    const updated = [...tasks];
    updated[taskIdx].options[optionIdx] = value;
    setTasks(updated);
  };

  const addOption = (taskIdx) => {
    const updated = [...tasks];
    updated[taskIdx].options.push('');
    setTasks(updated);
  };

  const removeOption = (taskIdx, optionIdx) => {
    const updated = [...tasks];
    updated[taskIdx].options.splice(optionIdx, 1);
    if (updated[taskIdx].correct_answer >= optionIdx) {
      updated[taskIdx].correct_answer = Math.max(0, updated[taskIdx].correct_answer - 1);
    }
    setTasks(updated);
  };

  const handleTestCaseChange = (taskIdx, caseIdx, field, value) => {
    const updated = [...tasks];
    updated[taskIdx].coding_test_cases[caseIdx][field] = value;
    setTasks(updated);
  };

  const addTestCase = (taskIdx) => {
    const updated = [...tasks];
    updated[taskIdx].coding_test_cases.push({ input: '', output: '', description: '' });
    setTasks(updated);
  };

  const removeTestCase = (taskIdx, caseIdx) => {
    const updated = [...tasks];
    updated[taskIdx].coding_test_cases.splice(caseIdx, 1);
    setTasks(updated);
  };

  // Enhanced task validation
  const validateTask = (task, index) => {
    const errors = [];
    
    if (!task.title || !task.title.trim()) {
      errors.push(`Task ${index + 1}: Title is required`);
    }
    
    if (!task.description || !task.description.trim()) {
      errors.push(`Task ${index + 1}: Description is required`);
    }
    
    if (task.type === 'mcq') {
      if (!task.question || !task.question.trim()) {
        errors.push(`Task ${index + 1}: Question is required`);
      }
      
      const validOptions = task.options.filter(opt => opt && opt.trim());
      if (validOptions.length < 2) {
        errors.push(`Task ${index + 1}: At least 2 options are required`);
      }
      
      if (task.correct_answer < 0 || task.correct_answer >= validOptions.length) {
        errors.push(`Task ${index + 1}: Please select a valid correct answer`);
      }
    }
    
    if (task.type === 'true_false') {
      if (!task.tf_question || !task.tf_question.trim()) {
        errors.push(`Task ${index + 1}: Question is required`);
      }
    }
    
    if (task.type === 'CODE') {
      if (!task.coding_question || !task.coding_question.trim()) {
        errors.push(`Task ${index + 1}: Coding question is required`);
      }
      
      if (!task.coding_solution || !task.coding_solution.trim()) {
        errors.push(`Task ${index + 1}: Coding solution is required`);
      }
      
      const validTestCases = task.coding_test_cases.filter(tc => tc.input && tc.input.trim() && tc.output && tc.output.trim());
      if (validTestCases.length === 0) {
        errors.push(`Task ${index + 1}: At least one test case is required`);
      }
    }
    
    return errors;
  };

  const validateTasks = () => {
    const allErrors = [];
    tasks.forEach((task, index) => {
      const taskErrors = validateTask(task, index);
      allErrors.push(...taskErrors);
    });
    
    if (allErrors.length > 0) {
      setTaskError(allErrors.join('\n'));
      return false;
    }
    
    setTaskError('');
    return true;
  };

  const validateForm = () => {
    const isNameValid = validateField('name', name);
    const isDescriptionValid = validateField('description', description);
    const isVideoIdValid = validateField('video_id', video_id);
    const isDurationValid = validateField('videoDuration', videoDuration);
    const isYearValid = validateField('year', year);
    const isSemesterValid = validateField('semester', semester);
    
    return isNameValid && isDescriptionValid && isVideoIdValid && isDurationValid && isYearValid && isSemesterValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormError('Please fix the form errors before submitting.');
      return;
    }
    
    if (!validateTasks()) {
      setFormError('Please fix the task errors before submitting.');
      return;
    }
    
    setLoading(true);
    setFormError('');
    
    try {
      const formData = {
        name: name.trim(),
        description: description.trim(),
        video_id: video_id.trim(),
        video_duration: videoDuration,
        year: parseInt(year),
        semester: parseInt(semester),
        paid: paid,
        tasks: tasks.map(task => ({
          ...task,
          title: task.title.trim(),
          description: task.description.trim(),
          options: task.options.filter(opt => opt && opt.trim()),
          coding_test_cases: task.coding_test_cases.filter(tc => tc.input && tc.input.trim() && tc.output && tc.output.trim())
        }))
      };
      
      if (editingCourse) {
        await apiClient.put(`/admin/courses/${editingCourse.id}`, formData);
      } else {
        await apiClient.post('/admin/courses', formData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      
      if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setFormError(errorMessages.join('\n'));
      } else {
        setFormError('An error occurred while saving the course. Please try again.');
      }
      
      // Dispatch custom event for error notification
      window.dispatchEvent(new CustomEvent('showErrorNotification', {
        detail: { message: error.response?.data?.message || 'Save failed. Please check the form for errors.' }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Extract video ID from URL
  const extractVideoId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : url;
  };

  // Convert ISO duration to hh:mm:ss format
  const convertDuration = (isoDuration) => {
    if (!isoDuration) return '00:10:00';
    
    // Handle ISO 8601 duration format (PT10M30S)
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return isoDuration;
  };

  // Fetch video duration from YouTube API
  const fetchVideoDuration = async (videoId) => {
    if (!videoId || videoId.length !== 11) return;
    
    setFetchingDuration(true);
    try {
      const response = await apiClient.get(`/youtube/video-duration/${videoId}`);
      if (response.data.duration) {
        const duration = convertDuration(response.data.duration);
        setVideoDuration(duration);
        setDurationAutoFetched(true);
      }
    } catch (error) {
      console.error('Error fetching video duration:', error);
    } finally {
      setFetchingDuration(false);
    }
  };

  const handleVideoUrlChange = (e) => {
    const value = e.target.value;
    setVideo_id(value);
    
    // Extract video ID if it's a URL
    const extractedId = extractVideoId(value);
    if (extractedId && extractedId.length === 11) {
      setVideo_id(extractedId);
      validateField('video_id', extractedId);
      validateCourseInRealTime(extractedId);
      
      // Auto-fetch duration if not already fetched
      if (!durationAutoFetched && !fetchingDuration) {
        fetchVideoDuration(extractedId);
      }
    } else {
      setVideo_id(value);
      validateField('video_id', value);
      setVideoValidation({
        isValid: false,
        isChecking: false,
        error: null,
        isDuplicate: false,
        duplicateCourse: null
      });
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <FaListUl className="task-type-icon mcq" title="Multiple Choice" />;
      case 'true_false':
        return <FaCheckCircle className="task-type-icon tf" title="True/False" />;
      case 'CODE':
        return <FaCode className="task-type-icon coding" title="Coding" />;
      default:
        return <FaTasks className="task-type-icon" />;
    }
  };

  const ErrorMessage = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="course-form-field-error"
    >
      <FaExclamationTriangle className="error-icon" />
      {message}
    </motion.div>
  );

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

  const renderMCQFields = (task, index) => (
    <div className="task-type-fields mcq-fields">
      <div className="form-group">
        <label>{t('admin.tasks.mcqQuestion')} *</label>
        <input
          type="text"
          value={task.question}
          onChange={(e) => handleTaskChange(index, 'question', e.target.value)}
          placeholder={t('admin.tasks.enterMCQQuestion')}
          required
        />
      </div>
      <div className="mcq-options-list">
        {task.options.map((option, optionIndex) => (
          <div className="mcq-option-card" key={optionIndex}>
            <input
              type="radio"
              name={`correct-${index}`}
              checked={task.correct_answer === optionIndex}
              onChange={() => handleTaskChange(index, 'correct_answer', optionIndex)}
              className="mcq-correct-radio"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
              placeholder={t('admin.tasks.enterOption')}
              className="mcq-option-input"
              required
            />
            {task.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index, optionIndex)}
                className="remove-option-btn"
                title={t('admin.tasks.removeOption')}
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addOption(index)}
          className="add-option-btn"
        >
          <FaPlus /> {t('admin.tasks.addOption')}
        </button>
      </div>
    </div>
  );

  const renderTrueFalseFields = (task, index) => (
    <div className="task-type-fields tf-fields">
      <div className="form-group">
        <label>{t('admin.tasks.trueFalseQuestion')} *</label>
        <input
          type="text"
          value={task.tf_question}
          onChange={(e) => handleTaskChange(index, 'tf_question', e.target.value)}
          placeholder={t('admin.tasks.enterTrueFalseQuestion')}
          required
        />
      </div>
      <div className="tf-radio-group">
        <label className="tf-radio-option">
          <input
            type="radio"
            name={`tf-${index}`}
            checked={task.tf_answer === true}
            onChange={() => handleTaskChange(index, 'tf_answer', true)}
          />
          {t('admin.tasks.true')}
        </label>
        <label className="tf-radio-option">
          <input
            type="radio"
            name={`tf-${index}`}
            checked={task.tf_answer === false}
            onChange={() => handleTaskChange(index, 'tf_answer', false)}
          />
          {t('admin.tasks.false')}
        </label>
      </div>
    </div>
  );

  const renderCodingFields = (task, index) => (
    <div className="task-type-fields coding-fields">
      <div className="form-group">
        <label>{t('admin.tasks.codingQuestion')} *</label>
        <input
          type="text"
          value={task.coding_question}
          onChange={(e) => handleTaskChange(index, 'coding_question', e.target.value)}
          placeholder={t('admin.tasks.enterCodingQuestion')}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('admin.tasks.programmingLanguage')} *</label>
        <select
          value={task.coding_language}
          onChange={(e) => handleTaskChange(index, 'coding_language', e.target.value)}
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
          onChange={(e) => handleTaskChange(index, 'coding_solution', e.target.value)}
          placeholder={t('admin.tasks.enterCodingSolution')}
        />
      </div>
      <div className="coding-test-cases-list">
        <label style={{fontWeight:600,marginBottom:'0.5rem'}}>{t('admin.tasks.testCases')}</label>
        {task.coding_test_cases.map((tc, idx) => (
          <div className="test-case-card" key={idx}>
            <input
              type="text"
              value={tc.input}
              onChange={(e) => handleTestCaseChange(index, idx, 'input', e.target.value)}
              placeholder={t('admin.tasks.input')}
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.output}
              onChange={(e) => handleTestCaseChange(index, idx, 'output', e.target.value)}
              placeholder={t('admin.tasks.output')}
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.description}
              onChange={(e) => handleTestCaseChange(index, idx, 'description', e.target.value)}
              placeholder={t('admin.tasks.testCaseDescription')}
              className="test-case-input"
            />
            {task.coding_test_cases.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeTestCase(index, idx)}
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
          onClick={() => addTestCase(index)}
        >
          <FaPlus /> {t('admin.tasks.addTestCase')}
        </button>
      </div>
    </div>
  );

  const validateCourseInRealTime = async (videoId) => {
    if (!videoId || videoId.length !== 11) {
      setVideoValidation({
        isValid: false,
        isChecking: false,
        error: 'Invalid video ID format',
        isDuplicate: false,
        duplicateCourse: null
      });
      return;
    }

    setVideoValidation({
      isValid: false,
      isChecking: true,
      error: null,
      isDuplicate: false,
      duplicateCourse: null
    });

    try {
      // Check if video ID already exists in another course
      const duplicateCourse = existingCourses.find(course => 
        course.video_id === videoId && course.id !== editingCourse?.id
      );

      if (duplicateCourse) {
        setVideoValidation({
          isValid: false,
          isChecking: false,
          error: null,
          isDuplicate: true,
          duplicateCourse: duplicateCourse
        });
        return;
      }

      // Here you could add YouTube API validation if needed
      setVideoValidation({
        isValid: true,
        isChecking: false,
        error: null,
        isDuplicate: false,
        duplicateCourse: null
      });
    } catch (error) {
      setVideoValidation({
        isValid: false,
        isChecking: false,
        error: 'Error validating video',
        isDuplicate: false,
        duplicateCourse: null
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="course-form-overlay"
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="course-form-container"
      >
        <div className="course-form-header">
          <h2 className="course-form-title">
            <FaPlus className="course-form-icon" />
            {editingCourse ? t('admin.courses.editCourse') : t('admin.courses.addCourse')}
          </h2>
          <button
            className="course-form-close-btn"
            onClick={onClose}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="course-form-error"
              ref={formErrorRef}
            >
              <FaExclamationTriangle className="error-icon" />
              {formError}
            </motion.div>
          )}

          <div className="course-form-group">
            <label className="course-form-label">
              {t('admin.courses.courseName')} *
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField('name', e.target.value);
              }}
              className={`course-form-input ${fieldErrors.name ? 'error' : ''}`}
              placeholder={t('common.enterCourseName')}
              ref={nameRef}
            />
            {fieldErrors.name && <ErrorMessage message={fieldErrors.name} />}
          </div>

          <div className="course-form-group">
            <label className="course-form-label">
              {t('admin.courses.description')} *
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                validateField('description', e.target.value);
              }}
              className={`course-form-textarea ${fieldErrors.description ? 'error' : ''}`}
              placeholder={t('common.enterCourseDescription')}
              rows="4"
              ref={descriptionRef}
            />
            {fieldErrors.description && <ErrorMessage message={fieldErrors.description} />}
          </div>

          <div className="course-form-row">
            <div className="course-form-group">
              <label className="course-form-label">
                {t('admin.courses.year')} *
              </label>
              <select
                name="year"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  validateField('year', e.target.value);
                }}
                className={`course-form-select ${fieldErrors.year ? 'error' : ''}`}
                ref={yearRef}
              >
                <option value="">{t('common.selectYear')}</option>
                <option value="1">{t('common.year1')}</option>
                <option value="2">{t('common.year2')}</option>
                <option value="3">{t('common.year3')}</option>
                <option value="4">{t('common.year4')}</option>
              </select>
              {fieldErrors.year && <ErrorMessage message={fieldErrors.year} />}
            </div>

            <div className="course-form-group">
              <label className="course-form-label">
                {t('admin.courses.semester')} *
              </label>
              <select
                name="semester"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  validateField('semester', e.target.value);
                }}
                className={`course-form-select ${fieldErrors.semester ? 'error' : ''}`}
                ref={semesterRef}
              >
                <option value="">{t('common.selectSemester')}</option>
                <option value="1">{t('common.semester1')}</option>
                <option value="2">{t('common.semester2')}</option>
              </select>
              {fieldErrors.semester && <ErrorMessage message={fieldErrors.semester} />}
            </div>

            <div className="course-form-group">
              <label className="course-form-label">
                {t('admin.courses.courseType')} *
              </label>
              <select
                name="paid"
                value={paid ? 'paid' : 'free'}
                onChange={e => setPaid(e.target.value === 'paid')}
                className="course-form-select"
              >
                <option value="free">{t('common.free')}</option>
                <option value="paid">{t('common.paid')}</option>
              </select>
            </div>
          </div>

          <div className="course-form-group">
            <label className="course-form-label">
              <FaYoutube className="course-form-label-icon" />
              {t('common.youtubeVideoUrlOrId')} *
            </label>
            <input
              type="text"
              name="video_url"
              value={video_id}
              onChange={handleVideoUrlChange}
              className={`course-form-input ${fieldErrors.video_id ? 'error' : ''} ${
                videoValidation.isValid ? 'valid' : videoValidation.error ? 'error' : ''
              }`}
              placeholder={t('common.enterYouTubeUrlOrId')}
              ref={videoIdRef}
            />
            {fieldErrors.video_id && <ErrorMessage message={fieldErrors.video_id} />}
            
            {/* Real-time validation feedback - show only one message at a time */}
            {videoValidation.isChecking && (
              <div className="course-form-validation-loading">
                <FaSpinner className="spinning" />
                <span>{t('common.validatingVideo')}</span>
              </div>
            )}
            
            {!videoValidation.isChecking && videoValidation.error && (
              <div className="course-form-validation-error">
                <FaExclamationTriangle className="error-icon" />
                <span>{videoValidation.error}</span>
              </div>
            )}
            
            {!videoValidation.isChecking && !videoValidation.error && videoValidation.isDuplicate && (
              <div className="course-form-validation-error">
                <FaExclamationTriangle className="error-icon" />
                <span>
                  {t('common.videoIdAlreadyExists', { 
                    courseName: videoValidation.duplicateCourse.name,
                    year: videoValidation.duplicateCourse.year,
                    semester: videoValidation.duplicateCourse.semester
                  })}
                </span>
              </div>
            )}
            
            {!videoValidation.isChecking && !videoValidation.error && !videoValidation.isDuplicate && videoValidation.isValid && (
              <div className="course-form-validation-success">
                <FaCheck className="success-icon" />
                <span>{t('common.videoValidationSuccessful')}</span>
              </div>
            )}
            
            {!videoValidation.isChecking && !videoValidation.error && !videoValidation.isDuplicate && video_id && !fieldErrors.video_id && (
              <div className="course-form-video-preview">
                <img
                  src={`https://img.youtube.com/vi/${video_id}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  className="course-form-thumbnail"
                />
                <span className="course-form-video-id">{t('common.videoId')}: {video_id}</span>
              </div>
            )}
          </div>

          <div className="course-form-group">
            <label className="course-form-label">
              {t('common.videoDuration')} *
            </label>
            <div className="course-form-duration-container">
            <input
              type="text"
              name="video_duration"
              value={videoDuration}
                onChange={(e) => {
                  setVideoDuration(e.target.value);
                  setDurationAutoFetched(false);
                  validateField('videoDuration', e.target.value);
                }}
                className={`course-form-input ${fieldErrors.videoDuration ? 'error' : ''}`}
              placeholder={t('common.enterDuration')}
              ref={videoDurationRef}
            />
              {fetchingDuration && (
                <div className="course-form-duration-loading">
                  <FaSpinner className="spinning" />
                  <span>{t('common.fetchingDuration')}</span>
                </div>
              )}
              {video_id && !fetchingDuration && !fieldErrors.video_id && (
                <div className="course-form-duration-info">
                  <span>{durationAutoFetched ? t('common.durationAutoFetched') : t('common.durationWillBeAutoFetched')}</span>
                </div>
              )}
            </div>
            {fieldErrors.videoDuration && <ErrorMessage message={fieldErrors.videoDuration} />}
          </div>

          {/* Enhanced Task Management Section */}
          <div className="course-form-tasks-section">
            <div className="course-form-tasks-header">
              <h3 className="course-form-tasks-title">
                <FaTasks className="course-form-tasks-icon" />
                {t('common.courseTasks')}
              </h3>
              <motion.button
                type="button"
                onClick={handleAddTask}
                className="course-form-add-task-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                {t('common.addTask')}
              </motion.button>
            </div>

            {taskError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="course-form-task-error"
                ref={taskErrorRef}
              >
                <FaExclamationTriangle className="error-icon" />
                {taskError}
              </motion.div>
            )}

            <AnimatePresence>
              {showTaskSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="course-form-tasks-content"
                >
            {tasks.length === 0 ? (
              <div className="course-form-no-tasks">
                <p>{t('common.noTasksAddedYet')}</p>
              </div>
            ) : (
              <div className="course-form-tasks-list">
                {tasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="multi-task-card"
                  >
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                      <span style={{fontWeight:700,fontSize:'1.1rem',color:'#b8860b'}}>{t('common.task')} {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="remove-btn"
                        title={t('admin.tasks.removeTask')}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>{t('common.taskTitle')} *</label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        placeholder={t('common.enterTaskTitle')}
                        className="course-form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('common.taskType')} *</label>
                      <select
                        value={task.type}
                        onChange={(e) => handleTaskChange(index, 'type', e.target.value)}
                        className="course-form-select"
                      >
                        <option value="mcq">{t('common.multipleChoice')}</option>
                        <option value="true_false">{t('common.trueFalse')}</option>
                        <option value="CODE">{t('common.coding')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{t('common.taskDescription')}</label>
                      <textarea
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                        placeholder={t('common.enterTaskDescription')}
                        rows="2"
                        className="course-form-textarea"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('common.timestamp')} {t('common.timestampFormat')}</label>
                        <TimestampInput
                          value={task.timestamp}
                          onChange={(value) => handleTaskChange(index, 'timestamp', value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t('common.points')}</label>
                        <input
                          type="number"
                          value={task.points}
                          onChange={(e) => handleTaskChange(index, 'points', Number(e.target.value))}
                          min="1"
                          className="course-form-input"
                        />
                      </div>
                    </div>

                    {/* Task Type Specific Fields */}
                    {task.type === 'mcq' && renderMCQFields(task, index)}
                    {task.type === 'true_false' && renderTrueFalseFields(task, index)}
                    {task.type === 'CODE' && renderCodingFields(task, index)}
                  </motion.div>
                ))}

                {/* Add Another Task Button - positioned after all tasks */}
                <motion.button
                  type="button"
                  onClick={handleAddTask}
                  className="multi-task-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlus />
                  {t('admin.tasks.addAnotherTask')}
                </motion.button>
              </div>
            )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          <div className="course-form-actions">
            <motion.button
              type="submit"
              className="course-form-submit-btn"
              disabled={loading || videoValidation.isChecking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinning" />
                  {editingCourse ? t('common.updating') : t('common.creating')}
                </>
              ) : videoValidation.isChecking ? (
                <>
                  <FaSpinner className="spinning" />
                  {t('common.validating')}
                </>
              ) : (
                <>
                  <FaSave />
                  {editingCourse ? t('common.updateCourse') : t('common.createCourse')}
                </>
              )}
            </motion.button>
            <button
              type="button"
              className="course-form-cancel-btn"
              onClick={onClose}
              disabled={loading || videoValidation.isChecking}
            >
              <FaTimes />
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CourseForm;
