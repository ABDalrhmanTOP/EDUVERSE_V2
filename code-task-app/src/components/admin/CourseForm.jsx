import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaSave, FaYoutube, FaTasks, FaTrash, FaExclamationTriangle, FaCode, FaListUl, FaCheckCircle, FaSpinner, FaChevronUp, FaChevronDown, FaCheck } from 'react-icons/fa';
import '../../styles/admin/CourseForm.css';

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
  }, [editingCourse]);

  useEffect(() => {
    setTaskError('');
  }, [tasks]);

  const fetchExistingCourses = async () => {
    try {
      const response = await axios.get('/courses');
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
    setTasks(course.tasks || []);
    setShowTaskSection(course.tasks && course.tasks.length > 0);
    setPaid(!!course.paid);
  };

  // Enhanced field validation
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) {
          errors.name = 'Course name is required';
        } else if (value.trim().length < 3) {
          errors.name = 'Course name must be at least 3 characters';
        } else {
          delete errors.name;
        }
        break;
      case 'description':
        if (!value || !value.trim()) {
          errors.description = 'Course description is required';
        } else if (value.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters';
        } else {
          delete errors.description;
        }
        break;
      case 'video_id':
        if (!value || !value.trim()) {
          errors.video_id = 'Video ID is required';
        } else if (!/^[a-zA-Z0-9_-]{11}$/.test(value)) {
          errors.video_id = 'Please enter a valid YouTube video ID (11 characters)';
        } else {
          delete errors.video_id;
        }
        break;
      case 'videoDuration':
        if (!value || !value.trim()) {
          errors.videoDuration = 'Video duration is required';
        } else if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
          errors.videoDuration = 'Please enter duration in format hh:mm:ss';
        } else {
          delete errors.videoDuration;
        }
        break;
      case 'year':
        if (!value || value === '') {
          errors.year = 'Please select a year';
        } else {
          delete errors.year;
        }
        break;
      case 'semester':
        if (!value || value === '') {
          errors.semester = 'Please select a semester';
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

  // Handle MCQ option changes
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
    if (updated[taskIdx].options.length <= 2) {
      setTaskError('MCQ must have at least 2 options');
      return;
    }
    updated[taskIdx].options.splice(optionIdx, 1);
    if (updated[taskIdx].correct_answer >= optionIdx) {
      updated[taskIdx].correct_answer = Math.max(0, updated[taskIdx].correct_answer - 1);
    }
    setTasks(updated);
    setTaskError('');
  };

  // Handle coding test cases
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
    if (!task.title || !task.title.trim()) {
      return `Task ${index + 1}: Title is required`;
    }

    switch (task.type) {
      case 'mcq':
        if (!task.question || !task.question.trim()) {
          return `Task ${index + 1}: Question is required for MCQ`;
        }
        if (task.options.some(opt => !opt.trim())) {
          return `Task ${index + 1}: All MCQ options must be filled`;
        }
        break;
      case 'true_false':
        if (!task.tf_question || !task.tf_question.trim()) {
          return `Task ${index + 1}: Question is required for True/False`;
        }
        break;
      case 'CODE':
        if (!task.coding_question || !task.coding_question.trim()) {
          return `Task ${index + 1}: Question is required for Coding task`;
        }
        if (task.coding_test_cases.some(tc => !tc.input.trim() || !tc.output.trim())) {
          return `Task ${index + 1}: All test cases must have input and output`;
        }
        break;
    }
    return null;
  };

  const validateTasks = () => {
    if (tasks.length === 0) return true;
    
    for (let i = 0; i < tasks.length; i++) {
      const error = validateTask(tasks[i], i);
      if (error) {
        setTaskError(error);
        return false;
      }
    }
    
    setTaskError('');
    return true;
  };

  // Enhanced validateForm to return first error field name
  const validateForm = () => {
    const fields = [
      { name: 'name', value: name, ref: nameRef },
      { name: 'description', value: description, ref: descriptionRef },
      { name: 'video_id', value: video_id, ref: videoIdRef },
      { name: 'videoDuration', value: videoDuration, ref: videoDurationRef },
      { name: 'year', value: year, ref: yearRef },
      { name: 'semester', value: semester, ref: semesterRef }
    ];
    let isValid = true;
    let firstErrorField = null;
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
        if (!firstErrorField) firstErrorField = field.ref;
      }
    });
    return { isValid, firstErrorField };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    let errorNotification = false;
    // Validate form fields and get first error ref
    const { isValid, firstErrorField } = validateForm();
    if (!isValid) {
      setFormError('Please fix the errors in the form fields.');
      setTimeout(() => {
        if (firstErrorField && firstErrorField.current) {
          firstErrorField.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.current.focus();
        } else if (formErrorRef.current) {
          formErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setLoading(false);
      errorNotification = true;
      return;
    }
    // Validate tasks
    if (!validateTasks()) {
      setTimeout(() => {
        if (taskErrorRef.current) {
          taskErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      setLoading(false);
      errorNotification = true;
      return;
    }

    // Check real-time validation results
    if (videoValidation.isChecking) {
      setFormError('Please wait for course validation to complete.');
      setLoading(false);
      return;
    }

    if (videoValidation.error) {
      setFormError(`Course validation failed: ${videoValidation.error}`);
      setLoading(false);
      return;
    }

    if (videoValidation.isDuplicate) {
      setFormError('This video ID is already used in another course. Please use a different video.');
      setLoading(false);
      return;
    }

    if (!videoValidation.isValid) {
      setFormError('Please ensure all course details are valid before submitting.');
      setLoading(false);
      return;
    }

    const data = { 
      video_id, 
      name, 
      description, 
      year: Number(year), 
      semester: Number(semester), 
      video_duration: videoDuration, 
      paid,
      tasks: tasks.map(t => {
        const taskData = {
          title: t.title,
          description: t.description,
          type: t.type,
          timestamp: t.timestamp,
          points: t.points
        };

        switch (t.type) {
          case 'mcq':
            taskData.question = t.question;
            taskData.options = t.options;
            taskData.correct_answer = t.correct_answer;
            break;
          case 'true_false':
            taskData.tf_question = t.tf_question;
            taskData.tf_answer = t.tf_answer;
            break;
          case 'CODE':
            taskData.coding_question = t.coding_question;
            taskData.coding_test_cases = t.coding_test_cases;
            taskData.coding_solution = t.coding_solution;
            taskData.coding_language = t.coding_language;
            break;
        }

        return taskData;
      })
    };

    try {
      if (editingCourse) {
        await axios.put(`/courses/${editingCourse.id}`, data);
      } else {
        await axios.post('/courses', data);
      }
      onSuccess();
    } catch (error) {
      setTimeout(() => {
        if (formErrorRef.current) {
          formErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      if (error.response && error.response.data) {
        const { error: errorType, message } = error.response.data;
        if (errorType === 'duplicate_video_id') {
          setFormError('A course with this video ID already exists. Please use a different video.');
          setFieldErrors(prev => ({
            ...prev,
            video_id: 'This video ID is already used by another course.'
          }));
        } else {
          setFormError(message || 'Error saving course. Please try again.');
        }
      } else {
        setFormError('Error saving course. Please try again.');
      }
      errorNotification = true;
    } finally {
      setLoading(false);
      if (errorNotification && window && window.dispatchEvent) {
        // Custom event for error notification (to be handled by parent or notification system)
        window.dispatchEvent(new CustomEvent('showErrorNotification', { detail: { message: 'Save failed. Please check the form for errors.' } }));
      }
    }
  };

  const extractVideoId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : url;
  };

  // Function to convert ISO 8601 duration to HH:MM:SS format
  const convertDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '00:00:00';
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to fetch video duration from YouTube API
  const fetchVideoDuration = async (videoId) => {
    if (!videoId) {
      // Keep the default duration and don't show error to user
      return;
    }

    setFetchingDuration(true);
    setDurationAutoFetched(false);

    try {
      const response = await axios.get(`youtube/video-duration/${videoId}`);
      if (response.data && response.data.duration) {
        const convertedDuration = convertDuration(response.data.duration);
        setVideoDuration(convertedDuration);
        setDurationAutoFetched(true);
      }
    } catch (error) {
      // Error fetching video duration
    } finally {
      setFetchingDuration(false);
    }
  };

  // Enhanced video URL change handler with duration fetching
  const handleVideoUrlChange = (e) => {
    const value = e.target.value;
    
    // Clear validation if field is empty
    if (!value.trim()) {
      setVideo_id('');
      setVideoValidation({
        isValid: false,
        isChecking: false,
        error: null,
        isDuplicate: false,
        duplicateCourse: null
      });
      return;
    }
    
    // If it looks like a full URL, extract video ID
    if (value.includes('youtube.com') || value.includes('youtu.be')) {
      const videoId = extractVideoId(value);
      setVideo_id(videoId);
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        fetchVideoDuration(videoId);
      }
    } else {
      // If it's just a video ID, set it directly
      const videoId = value.trim();
      setVideo_id(videoId);
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        fetchVideoDuration(videoId);
      }
    }
  };

  // Validate video_id whenever it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't validate on initial load
    
    // Add a small delay to ensure state is updated before validation
    const timeoutId = setTimeout(() => {
      if (video_id !== undefined && video_id !== '') {
        validateField('video_id', video_id);
      } else if (video_id === '') {
        // Clear the error when field is empty
        const errors = { ...fieldErrors };
        delete errors.video_id;
        setFieldErrors(errors);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [video_id, isInitialized]);

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <FaListUl className="task-type-icon mcq" />;
      case 'true_false':
        return <FaCheckCircle className="task-type-icon tf" />;
      case 'CODE':
        return <FaCode className="task-type-icon coding" />;
      default:
        return null;
    }
  };

  const ErrorMessage = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="field-error-message"
    >
      <FaExclamationTriangle className="error-icon" />
      {message}
    </motion.div>
  );

  // Custom timestamp input component with increment/decrement arrows
  const TimestampInput = ({ value, onChange, placeholder = "00:00:00" }) => {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    // Parse timestamp on mount and when value changes
    useEffect(() => {
      if (value) {
        const parts = value.split(':');
        if (parts.length === 3) {
          setHours(parseInt(parts[0]) || 0);
          setMinutes(parseInt(parts[1]) || 0);
          setSeconds(parseInt(parts[2]) || 0);
        } else if (parts.length === 2) {
          setHours(0);
          setMinutes(parseInt(parts[0]) || 0);
          setSeconds(parseInt(parts[1]) || 0);
        }
      }
    }, [value]);

    const updateParent = (h, m, s) => {
      const timestamp = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      onChange(timestamp);
    };

    const increment = (type) => {
      switch (type) {
        case 'hours':
          const newHours = Math.min(hours + 1, 23);
          setHours(newHours);
          updateParent(newHours, minutes, seconds);
          break;
        case 'minutes':
          const newMinutes = Math.min(minutes + 1, 59);
          setMinutes(newMinutes);
          updateParent(hours, newMinutes, seconds);
          break;
        case 'seconds':
          const newSeconds = Math.min(seconds + 1, 59);
          setSeconds(newSeconds);
          updateParent(hours, minutes, newSeconds);
          break;
      }
    };

    const decrement = (type) => {
      switch (type) {
        case 'hours':
          const newHours = Math.max(hours - 1, 0);
          setHours(newHours);
          updateParent(newHours, minutes, seconds);
          break;
        case 'minutes':
          const newMinutes = Math.max(minutes - 1, 0);
          setMinutes(newMinutes);
          updateParent(hours, newMinutes, seconds);
          break;
        case 'seconds':
          const newSeconds = Math.max(seconds - 1, 0);
          setSeconds(newSeconds);
          updateParent(hours, minutes, newSeconds);
          break;
      }
    };

    const handleInputChange = (type, newValue) => {
      const numValue = parseInt(newValue) || 0;
      let h = hours, m = minutes, s = seconds;
      
      switch (type) {
        case 'hours':
          h = Math.min(Math.max(numValue, 0), 23);
          setHours(h);
          break;
        case 'minutes':
          m = Math.min(Math.max(numValue, 0), 59);
          setMinutes(m);
          break;
        case 'seconds':
          s = Math.min(Math.max(numValue, 0), 59);
          setSeconds(s);
          break;
      }
      
      updateParent(h, m, s);
    };

    return (
      <div className="timestamp-input-container">
        <div className="timestamp-input-group">
          <button
            type="button"
            className="timestamp-arrow-btn"
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
            placeholder="00"
          />
          <button
            type="button"
            className="timestamp-arrow-btn"
            onClick={() => decrement('hours')}
          >
            <FaChevronDown />
          </button>
        </div>
        <span className="timestamp-separator">:</span>
        <div className="timestamp-input-group">
          <button
            type="button"
            className="timestamp-arrow-btn"
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
            placeholder="00"
          />
          <button
            type="button"
            className="timestamp-arrow-btn"
            onClick={() => decrement('minutes')}
          >
            <FaChevronDown />
          </button>
        </div>
        <span className="timestamp-separator">:</span>
        <div className="timestamp-input-group">
          <button
            type="button"
            className="timestamp-arrow-btn"
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
            placeholder="00"
          />
          <button
            type="button"
            className="timestamp-arrow-btn"
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
        <label>MCQ Question *</label>
        <input
          type="text"
          value={task.question}
          onChange={(e) => handleTaskChange(index, 'question', e.target.value)}
          placeholder="Enter MCQ question..."
          className="course-form-input"
        />
      </div>
      <div className="mcq-options-list">
        {task.options.map((option, optionIdx) => (
          <div className="mcq-option-card" key={optionIdx}>
            <input
              type="radio"
              name={`correct_answer_${index}`}
              checked={task.correct_answer === optionIdx}
              onChange={(e) => handleTaskChange(index, 'correct_answer', Number(e.target.value))}
              className="mcq-correct-radio"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, optionIdx, e.target.value)}
              placeholder={`Option ${optionIdx + 1}`}
              className="mcq-option-input"
            />
            <button
              type="button"
              onClick={() => removeOption(index, optionIdx)}
              className="remove-option-btn"
              disabled={task.options.length <= 2}
            >
              <FaTrash />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addOption(index)}
          className="add-option-btn"
        >
          <FaPlus /> Add Option
        </button>
      </div>
    </div>
  );

  const renderTrueFalseFields = (task, index) => (
    <div className="task-type-fields tf-fields">
      <div className="form-group">
        <label>True/False Question *</label>
        <input
          type="text"
          value={task.tf_question}
          onChange={(e) => handleTaskChange(index, 'tf_question', e.target.value)}
          placeholder="Enter True/False question..."
          className="course-form-input"
        />
      </div>
      <div className="form-group">
        <label>Correct Answer *</label>
        <select
          value={task.tf_answer}
          onChange={(e) => handleTaskChange(index, 'tf_answer', e.target.value === 'true')}
          className="course-form-select"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    </div>
  );

  const renderCodingFields = (task, index) => (
    <div className="task-type-fields coding-fields">
      <div className="form-group">
        <label>Programming Language *</label>
        <select
          value={task.coding_language}
          onChange={(e) => handleTaskChange(index, 'coding_language', e.target.value)}
          className="course-form-select"
        >
          {languageOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Coding Question *</label>
        <textarea
          value={task.coding_question}
          onChange={(e) => handleTaskChange(index, 'coding_question', e.target.value)}
          placeholder="Enter the coding problem..."
          rows="4"
          className="course-form-textarea"
        />
      </div>
      <div className="form-group">
        <label>Test Cases *</label>
        <div className="test-cases-list">
          {task.coding_test_cases.map((testCase, caseIdx) => (
            <div className="test-case-card" key={caseIdx}>
              <div className="test-case-header">
                <h5>Test Case {caseIdx + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeTestCase(index, caseIdx)}
                  className="remove-test-case-btn"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="test-case-inputs">
                <input
                  type="text"
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, caseIdx, 'input', e.target.value)}
                  placeholder="Input"
                  className="course-form-input"
                />
                <input
                  type="text"
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(index, caseIdx, 'output', e.target.value)}
                  placeholder="Expected Output"
                  className="course-form-input"
                />
                <input
                  type="text"
                  value={testCase.description}
                  onChange={(e) => handleTestCaseChange(index, caseIdx, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  className="course-form-input"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addTestCase(index)}
            className="add-test-case-btn"
          >
            <FaPlus /> Add Test Case
          </button>
        </div>
      </div>
      <div className="form-group">
        <label>Solution Code</label>
        <textarea
          value={task.coding_solution}
          onChange={(e) => handleTaskChange(index, 'coding_solution', e.target.value)}
          placeholder="Enter the solution code..."
          rows="6"
          className="course-form-textarea"
        />
      </div>
    </div>
  );

  // Real-time course validation - only checks video ID
  const validateCourseInRealTime = async (videoId) => {
    if (!videoId) {
      setVideoValidation({
        isValid: false,
        isChecking: false,
        error: null,
        isDuplicate: false,
        duplicateCourse: null
      });
      return;
    }

    setVideoValidation(prev => ({ ...prev, isChecking: true, error: null, isDuplicate: false }));

    try {
      // Validate video ID format first
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        setVideoValidation({
          isValid: false,
          isChecking: false,
          error: 'Please enter a valid YouTube video ID (11 characters)',
          isDuplicate: false,
          duplicateCourse: null
        });
        return;
      }

      // Check for duplicate video ID (regardless of other fields)
      const duplicate = existingCourses.find(c =>
        c.video_id === videoId &&
        (!editingCourse || c.id !== editingCourse.id)
      );

      if (duplicate) {
        setVideoValidation({
          isValid: false,
          isChecking: false,
          error: null,
          isDuplicate: true,
          duplicateCourse: duplicate
        });
        return;
      }

      // Check if video exists and is accessible
      const response = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      if (!response.ok) {
        setVideoValidation({
          isValid: false,
          isChecking: false,
          error: 'Video not found or not accessible',
          isDuplicate: false,
          duplicateCourse: null
        });
        return;
      }

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

  // Debounced validation - only triggers when video_id changes
  useEffect(() => {
    let isMounted = true;
    
    const timeoutId = setTimeout(() => {
      if (video_id && isMounted) {
        validateCourseInRealTime(video_id);
      }
    }, 300); // Reduced delay for faster response

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [video_id]); // Only depend on video_id

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="course-form-overlay"
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
            {editingCourse ? 'Edit Course' : 'Add New Course'}
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
              Course Name *
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
              placeholder="Enter course name"
              ref={nameRef}
            />
            {fieldErrors.name && <ErrorMessage message={fieldErrors.name} />}
          </div>

          <div className="course-form-group">
            <label className="course-form-label">
              Description *
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                validateField('description', e.target.value);
              }}
              className={`course-form-textarea ${fieldErrors.description ? 'error' : ''}`}
              placeholder="Enter course description"
              rows="4"
              ref={descriptionRef}
            />
            {fieldErrors.description && <ErrorMessage message={fieldErrors.description} />}
          </div>

          <div className="course-form-row">
            <div className="course-form-group">
              <label className="course-form-label">
                Year *
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
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
              {fieldErrors.year && <ErrorMessage message={fieldErrors.year} />}
            </div>

            <div className="course-form-group">
              <label className="course-form-label">
                Semester *
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
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
              {fieldErrors.semester && <ErrorMessage message={fieldErrors.semester} />}
            </div>

            <div className="course-form-group">
              <label className="course-form-label">
                Course Type *
              </label>
              <select
                name="paid"
                value={paid ? 'paid' : 'free'}
                onChange={e => setPaid(e.target.value === 'paid')}
                className="course-form-select"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="course-form-group">
            <label className="course-form-label">
              <FaYoutube className="course-form-label-icon" />
              YouTube Video URL or ID *
            </label>
            <input
              type="text"
              name="video_url"
              value={video_id}
              onChange={handleVideoUrlChange}
              className={`course-form-input ${fieldErrors.video_id ? 'error' : ''} ${
                videoValidation.isValid ? 'valid' : videoValidation.error ? 'error' : ''
              }`}
              placeholder="Enter YouTube URL or video ID"
              ref={videoIdRef}
            />
            {fieldErrors.video_id && <ErrorMessage message={fieldErrors.video_id} />}
            
            {/* Real-time validation feedback - show only one message at a time */}
            {videoValidation.isChecking && (
              <div className="course-form-validation-loading">
                <FaSpinner className="spinning" />
                <span>Validating video...</span>
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
                  Video ID already exists in course: "{videoValidation.duplicateCourse.name}" 
                  (Year {videoValidation.duplicateCourse.year}, Semester {videoValidation.duplicateCourse.semester})
                </span>
              </div>
            )}
            
            {!videoValidation.isChecking && !videoValidation.error && !videoValidation.isDuplicate && videoValidation.isValid && (
              <div className="course-form-validation-success">
                <FaCheck className="success-icon" />
                <span>Video validation successful!</span>
              </div>
            )}
            
            {!videoValidation.isChecking && !videoValidation.error && !videoValidation.isDuplicate && video_id && !fieldErrors.video_id && (
              <div className="course-form-video-preview">
                <img
                  src={`https://img.youtube.com/vi/${video_id}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  className="course-form-thumbnail"
                />
                <span className="course-form-video-id">Video ID: {video_id}</span>
              </div>
            )}
          </div>

          <div className="course-form-group">
            <label className="course-form-label">
              Video Duration (hh:mm:ss) *
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
              placeholder="e.g., 00:10:00 for 10 minutes"
              ref={videoDurationRef}
            />
              {fetchingDuration && (
                <div className="course-form-duration-loading">
                  <FaSpinner className="spinning" />
                  <span>Fetching duration...</span>
                </div>
              )}
              {video_id && !fetchingDuration && !fieldErrors.video_id && (
                <div className="course-form-duration-info">
                  <span>{durationAutoFetched ? 'Duration auto-fetched from YouTube' : 'Duration will be auto-fetched'}</span>
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
                Course Tasks
              </h3>
              <motion.button
                type="button"
                onClick={handleAddTask}
                className="course-form-add-task-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                Add Task
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
                <p>No tasks added yet. Click "Add Task" to create your first task.</p>
              </div>
            ) : (
              <div className="course-form-tasks-list">
                {tasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                    className="course-form-task-item"
                  >
                    <div className="course-form-task-header">
                            <div className="task-header-left">
                      <h4>Task {index + 1}</h4>
                              {getTaskTypeIcon(task.type)}
                            </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="course-form-remove-task-btn"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="course-form-task-fields">
                      <div className="course-form-task-row">
                        <div className="course-form-task-group">
                                <label>Task Title *</label>
                            <input
                              type="text"
                                  value={task.title}
                                  onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                                  placeholder="Enter task title..."
                                  className="course-form-input"
                                />
                        </div>

                        <div className="course-form-task-group">
                                <label>Task Type *</label>
                          <select
                            value={task.type}
                            onChange={(e) => handleTaskChange(index, 'type', e.target.value)}
                            className="course-form-select"
                          >
                            <option value="mcq">Multiple Choice</option>
                                  <option value="true_false">True/False</option>
                            <option value="CODE">Coding</option>
                          </select>
                        </div>
                      </div>

                      <div className="course-form-task-group">
                              <label>Task Description</label>
                        <textarea
                                value={task.description}
                                onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                                placeholder="Enter task description..."
                                rows="2"
                          className="course-form-textarea"
                        />
                      </div>

                            <div className="course-form-task-row">
                        <div className="course-form-task-group">
                                <label>Timestamp (hh:mm:ss)</label>
                                <TimestampInput
                                  value={task.timestamp}
                                  onChange={(value) => handleTaskChange(index, 'timestamp', value)}
                          />
                        </div>

                        <div className="course-form-task-group">
                                <label>Points</label>
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
                    </div>
                  </motion.div>
                ))}

                      {/* Add Another Task Button - positioned after all tasks */}
            <motion.button
              type="button"
                        onClick={handleAddTask}
                        className="course-form-add-another-task-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                        <FaPlus />
                        Add Another Task
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
                  {editingCourse ? 'Updating...' : 'Creating...'}
                </>
              ) : videoValidation.isChecking ? (
                <>
                  <FaSpinner className="spinning" />
                  Validating...
                </>
              ) : (
                <>
                  <FaSave />
                  {editingCourse ? 'Update Course' : 'Create Course'}
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
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CourseForm;
