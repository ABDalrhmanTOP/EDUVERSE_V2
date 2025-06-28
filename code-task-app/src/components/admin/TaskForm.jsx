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
    description: task.description || '',
    type: task.type || 'mcq',
    timestamp: task.timestamp || '',
    points: task.points || 1,
    question: task.question || '',
    options: Array.isArray(task.options) ? task.options : ['', '', '', ''],
    correct_answer: task.correct_answer || 0,
    tf_question: task.tf_question || '',
    tf_answer: task.tf_answer !== undefined ? task.tf_answer : true,
    coding_question: task.coding_question || '',
    coding_test_cases: Array.isArray(task.coding_test_cases) ? task.coding_test_cases : [{ input: '', output: '', description: '' }],
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
      setError(t('admin.tasks.mcqMustHaveAtLeast2Options'));
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
    switch (task.type) {
      case 'mcq':
        if (!task.question.trim()) return t('admin.tasks.questionRequiredForMCQ');
        if (task.options.some(opt => !opt.trim())) return t('admin.tasks.allMCQOptionsMustBeFilled');
        break;
      case 'true_false':
        if (!task.tf_question.trim()) return t('admin.tasks.questionRequiredForTrueFalse');
        break;
      case 'CODE':
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
    }
    setLoading(true);
    try {
      await onSave(tasks);
    } catch (err) {
      setError(t('admin.tasks.errorSavingTasks'));
    } finally {
      setLoading(false);
    }
  };

  const renderMCQFields = (task) => (
    <div className="task-type-fields mcq-fields">
      <div className="form-group">
        <label>{t('admin.tasks.mcqQuestion')} *</label>
        <input
          type="text"
          value={task.question}
          onChange={(e) => handleInputChange('question', e.target.value)}
          placeholder={t('admin.tasks.enterMCQQuestion')}
          required
        />
      </div>
      <div className="mcq-options-list">
        {(Array.isArray(task.options) ? task.options : ['', '', '', '']).map((option, idx) => (
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
              placeholder={t('admin.tasks.enterOption')}
              className="mcq-option-input"
              required
            />
            {(Array.isArray(task.options) ? task.options : ['', '', '', '']).length > 2 && (
              <button
                type="button"
                className="remove-option-btn"
                onClick={() => removeOption(tasks.indexOf(task))}
                title={t('admin.tasks.removeOption')}
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
          <FaPlus /> {t('admin.tasks.addOption')}
        </button>
      </div>
    </div>
  );

  const renderTrueFalseFields = (task) => (
    <div className="task-type-fields tf-fields">
      <div className="form-group">
        <label>{t('admin.tasks.trueFalseQuestion')} *</label>
        <input
          type="text"
          value={task.tf_question}
          onChange={(e) => handleInputChange('tf_question', e.target.value)}
          placeholder={t('admin.tasks.enterTrueFalseQuestion')}
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
          {t('admin.tasks.true')}
        </label>
        <label>
          <input
            type="radio"
            name="tf_answer"
            checked={task.tf_answer === false}
            onChange={(e) => handleInputChange('tf_answer', false)}
          />
          {t('admin.tasks.false')}
        </label>
      </div>
    </div>
  );

  const renderCodingFields = (task) => (
    <div className="task-type-fields coding-fields">
      <div className="form-group">
        <label>{t('admin.tasks.codingQuestion')} *</label>
        <input
          type="text"
          value={task.coding_question}
          onChange={(e) => handleInputChange('coding_question', e.target.value)}
          placeholder={t('admin.tasks.enterCodingQuestion')}
          required
        />
      </div>
      <div className="form-group">
        <label>{t('admin.tasks.programmingLanguage')} *</label>
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
        <label>{t('admin.tasks.codingSolution')} ({t('common.optional')})</label>
        <textarea
          value={task.coding_solution}
          onChange={(e) => handleInputChange('coding_solution', e.target.value)}
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
              onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
              placeholder={t('admin.tasks.input')}
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.output}
              onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
              placeholder={t('admin.tasks.output')}
              className="test-case-input"
              required
            />
            <input
              type="text"
              value={tc.description}
              onChange={(e) => handleTestCaseChange(idx, 'description', e.target.value)}
              placeholder={t('admin.tasks.testCaseDescription')}
              className="test-case-input"
            />
            {(Array.isArray(task.coding_test_cases) ? task.coding_test_cases : [{ input: '', output: '', description: '' }]).length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeTestCase(idx)}
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
          onClick={() => addTestCase(tasks.indexOf(task))}
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
                  <label>{t('admin.tasks.taskType')} *</label>
                  <select
                    value={taskItem.type}
                    onChange={(e) => handleTaskChange(idx, 'type', e.target.value)}
                    required
                  >
                    <option value="mcq">{t('admin.tasks.multipleChoice')}</option>
                    <option value="true_false">{t('admin.tasks.trueFalse')}</option>
                    <option value="CODE">{t('admin.tasks.coding')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.tasks.taskDescription')}</label>
                  <textarea
                    value={taskItem.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('admin.tasks.enterTaskDescription')}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.tasks.timestamp')} {t('admin.tasks.timestampFormat')}</label>
                    <TimestampInput
                      value={taskItem.timestamp}
                      onChange={(value) => handleInputChange('timestamp', value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.tasks.points')}</label>
                    <input
                      type="number"
                      value={taskItem.points}
                      onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                {/* Task Type Specific Fields */}
                {taskItem.type === 'mcq' && renderMCQFields(taskItem)}
                {taskItem.type === 'true_false' && renderTrueFalseFields(taskItem)}
                {taskItem.type === 'CODE' && renderCodingFields(taskItem)}
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