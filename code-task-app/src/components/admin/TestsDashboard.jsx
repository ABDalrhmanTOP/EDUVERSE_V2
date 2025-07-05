import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaCode, 
  FaClipboardCheck,
  FaListUl,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaList,
  FaCheck,
  FaCodeBranch
} from 'react-icons/fa';
import '../../styles/admin/TestsDashboard.css';
import apiClient from '../../api/axios';
import ConfirmationModal from './ConfirmationModal';

const TestsDashboard = () => {
  const { t, i18n } = useTranslation();
  
  // Helper function to get question type icon
  const getQuestionTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'mcq':
        return <FaListUl size={16} />;
      case 'tf':
      case 'true_false':
      case 'truefalse':
        return <FaCheckCircle size={16} />;
      case 'coding':
      case 'code':
        return <FaCode size={16} />;
      default:
        return <FaQuestionCircle size={16} />;
    }
  };
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placementTest, setPlacementTest] = useState(null);
  const [finalTest, setFinalTest] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', test: null });
  const [successMsg, setSuccessMsg] = useState('');
  const [testModal, setTestModal] = useState({ isOpen: false, type: '', mode: 'add', test: null });
  const [testForm, setTestForm] = useState({ title: '', description: '' });
  const [testFormLoading, setTestFormLoading] = useState(false);
  const testTitleRef = useRef();
  const [placementQuestions, setPlacementQuestions] = useState([]);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [questionModal, setQuestionModal] = useState({ isOpen: false, type: '', mode: 'add', testId: null, question: null });
  const [questionForm, setQuestionForm] = useState({ 
    type: 'mcq', 
    question: '', 
    options: [''], 
    correct_answer: '', 
    difficulty: '', 
    code_template: '', 
    test_cases: [''] 
  });
  const [questionFormLoading, setQuestionFormLoading] = useState(false);

  // Handle ESC key and outside click for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (testModal.isOpen) closeTestModal();
        if (questionModal.isOpen) closeQuestionModal();
        if (deleteModal.isOpen) setDeleteModal({ isOpen: false, type: '', test: null });
      }
    };

    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('confirmation-modal-overlay')) {
        if (testModal.isOpen) closeTestModal();
        if (questionModal.isOpen) closeQuestionModal();
        if (deleteModal.isOpen) setDeleteModal({ isOpen: false, type: '', test: null });
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [testModal.isOpen, questionModal.isOpen, deleteModal.isOpen]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/admin/courses');
        setCourses(res.data || []);
      } catch (err) {
        setError(t('common.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [t]);

  useEffect(() => {
    if (!selectedCourse) {
      setPlacementTest(null);
      setFinalTest(null);
      return;
    }
    setTestLoading(true);
    setTestError('');
    // Fetch placement and final test for this course
    Promise.all([
      apiClient.get(`/admin/placement-tests?course_id=${selectedCourse.id}`),
      apiClient.get(`/admin/final-tests?course_id=${selectedCourse.id}`)
    ])
      .then(([placementRes, finalRes]) => {
        setPlacementTest(placementRes.data[0] || null);
        setFinalTest(finalRes.data[0] || null);
      })
      .catch(() => setTestError(t('common.failedToLoad')))
      .finally(() => setTestLoading(false));
  }, [selectedCourse, t]);

  // Fetch questions when a test is present
  useEffect(() => {
    if (placementTest) {
      setQuestionsLoading(true);
      apiClient.get(`/admin/placement-test-questions?placement_test_id=${placementTest.id}`)
        .then(res => setPlacementQuestions(res.data))
        .catch(() => setQuestionsError(t('common.failedToLoad')))
        .finally(() => setQuestionsLoading(false));
    } else {
      setPlacementQuestions([]);
    }
  }, [placementTest, t]);

  useEffect(() => {
    if (finalTest) {
      setQuestionsLoading(true);
      apiClient.get(`/admin/final-test-questions?final_test_id=${finalTest.id}`)
        .then(res => setFinalQuestions(res.data))
        .catch(() => setQuestionsError(t('common.failedToLoad')))
        .finally(() => setQuestionsLoading(false));
    } else {
      setFinalQuestions([]);
    }
  }, [finalTest, t]);

  const handleDeleteTest = async () => {
    if (!deleteModal.test || !deleteModal.type) return;
    try {
      const endpoint = deleteModal.type === 'placement' ? `/admin/placement-tests/${deleteModal.test.id}` : `/admin/final-tests/${deleteModal.test.id}`;
      await apiClient.delete(endpoint);
      if (deleteModal.type === 'placement') setPlacementTest(null);
      else setFinalTest(null);
      setSuccessMsg(`${deleteModal.type === 'placement' ? 'Placement' : 'Final'} test deleted successfully.`);
    } catch {
      setSuccessMsg('Failed to delete test.');
    }
    setDeleteModal({ isOpen: false, type: '', test: null });
  };

  const openTestModal = (type, mode, test = null) => {
    setTestModal({ isOpen: true, type, mode, test });
    setTestForm({
      title: test?.title || '',
      description: test?.description || ''
    });
    setTimeout(() => testTitleRef.current?.focus(), 100);
  };

  const closeTestModal = () => {
    setTestModal({ isOpen: false, type: '', mode: 'add', test: null });
    setTestForm({ title: '', description: '' });
  };

  const handleTestFormChange = e => {
    setTestForm({ ...testForm, [e.target.name]: e.target.value });
  };

  const handleTestFormSubmit = async e => {
    e.preventDefault();
    setTestFormLoading(true);
    try {
      const endpoint = testModal.type === 'placement' ? '/admin/placement-tests' : '/admin/final-tests';
      if (testModal.mode === 'add') {
        const res = await apiClient.post(endpoint, {
          course_id: selectedCourse.id,
          ...testForm
        });
        if (testModal.type === 'placement') setPlacementTest(res.data);
        else setFinalTest(res.data);
        setSuccessMsg(`${testModal.type === 'placement' ? 'Placement' : 'Final'} test created successfully.`);
      } else {
        const res = await apiClient.put(`${endpoint}/${testModal.test.id}`, testForm);
        if (testModal.type === 'placement') setPlacementTest(res.data);
        else setFinalTest(res.data);
        setSuccessMsg(`${testModal.type === 'placement' ? 'Placement' : 'Final'} test updated successfully.`);
      }
      closeTestModal();
    } catch {
      setSuccessMsg('Failed to save test.');
    }
    setTestFormLoading(false);
  };

  const openQuestionModal = (type, mode, testId, question = null) => {
    setQuestionModal({ isOpen: true, type, mode, testId, question });
    if (question) {
      setQuestionForm({
        type: question.type,
        question: question.question,
        options: question.options ? (Array.isArray(question.options) ? question.options : JSON.parse(question.options)) : [''],
        correct_answer: question.correct_answer,
        difficulty: question.difficulty || '',
        code_template: question.code_template || '',
        test_cases: question.test_cases ? (Array.isArray(question.test_cases) ? question.test_cases : JSON.parse(question.test_cases)) : ['']
      });
    } else {
      setQuestionForm({ type: 'mcq', question: '', options: [''], correct_answer: '', difficulty: '', code_template: '', test_cases: [''] });
    }
  };

  const closeQuestionModal = () => {
    setQuestionModal({ isOpen: false, type: '', mode: 'add', testId: null, question: null });
    setQuestionForm({ type: 'mcq', question: '', options: [''], correct_answer: '', difficulty: '', code_template: '', test_cases: [''] });
  };

  const handleQuestionFormChange = e => {
    setQuestionForm({ ...questionForm, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...questionForm.options];
    newOptions[idx] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => setQuestionForm({ ...questionForm, options: [...questionForm.options, ''] });
  const removeOption = idx => setQuestionForm({ ...questionForm, options: questionForm.options.filter((_, i) => i !== idx) });
  
  const handleTestCaseChange = (idx, value) => {
    const newCases = [...questionForm.test_cases];
    newCases[idx] = value;
    setQuestionForm({ ...questionForm, test_cases: newCases });
  };
  
  const addTestCase = () => setQuestionForm({ ...questionForm, test_cases: [...questionForm.test_cases, ''] });
  const removeTestCase = idx => setQuestionForm({ ...questionForm, test_cases: questionForm.test_cases.filter((_, i) => i !== idx) });

  const handleQuestionFormSubmit = async e => {
    e.preventDefault();
    setQuestionFormLoading(true);
    try {
      let endpoint, payload;
      if (questionModal.type === 'placement') {
        endpoint = '/admin/placement-test-questions';
        payload = { placement_test_id: questionModal.testId, ...questionForm };
      } else {
        endpoint = '/admin/final-test-questions';
        payload = { final_test_id: questionModal.testId, ...questionForm };
      }
      if (questionForm.type === 'mcq' || questionForm.type === 'code') payload.options = questionForm.options;
      if (questionForm.type === 'code') payload.test_cases = questionForm.test_cases;
      if (questionModal.mode === 'add') {
        await apiClient.post(endpoint, payload);
      } else {
        await apiClient.put(`${endpoint}/${questionModal.question.id}`, payload);
      }
      // Refresh questions
      if (questionModal.type === 'placement') {
        const res = await apiClient.get(`/admin/placement-test-questions?placement_test_id=${questionModal.testId}`);
        setPlacementQuestions(res.data);
      } else {
        const res = await apiClient.get(`/admin/final-test-questions?final_test_id=${questionModal.testId}`);
        setFinalQuestions(res.data);
      }
      setSuccessMsg(`Question ${questionModal.mode === 'add' ? 'added' : 'updated'} successfully.`);
      closeQuestionModal();
    } catch {
      setSuccessMsg('Failed to save question.');
    }
    setQuestionFormLoading(false);
  };

  const handleDeleteQuestion = async (type, testId, questionId) => {
    try {
      const endpoint = type === 'placement' ? '/admin/placement-test-questions' : '/admin/final-test-questions';
      await apiClient.delete(`${endpoint}/${questionId}`);
      if (type === 'placement') {
        const res = await apiClient.get(`/admin/placement-test-questions?placement_test_id=${testId}`);
        setPlacementQuestions(res.data);
      } else {
        const res = await apiClient.get(`/admin/final-test-questions?final_test_id=${testId}`);
        setFinalQuestions(res.data);
      }
      setSuccessMsg('Question deleted successfully.');
    } catch {
      setSuccessMsg('Failed to delete question.');
    }
  };

  if (loading) {
    return (
      <div className="tests-dashboard" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="tests-loading">
          <div className="tests-loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tests-dashboard" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="tests-error">
          <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="tests-dashboard" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <motion.div
        className="tests-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{t('admin.navigation.tests')}</h1>
        <p>{i18n.language === 'ar' ? 'إدارة الاختبارات والتقييمات' : 'Manage tests and assessments for your courses'}</p>
      </motion.div>

      {/* Course Selector */}
    <motion.div
        className="course-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <label htmlFor="course-select">
          <FaListUl style={{ marginRight: '0.5rem' }} />
          {i18n.language === 'ar' ? 'اختر الدورة:' : 'Select Course:'}
        </label>
        <select
          id="course-select"
          value={selectedCourse ? selectedCourse.id : ''}
          onChange={e => {
            const course = courses.find(c => c.id === Number(e.target.value));
            setSelectedCourse(course);
          }}
        >
          <option value="">{i18n.language === 'ar' ? '-- اختر دورة --' : '-- Choose a course --'}</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Empty State */}
      {!selectedCourse && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="empty-state-icon">
            <FaClipboardCheck />
      </div>
          <h2 className="empty-state-title">
            {i18n.language === 'ar' ? 'اختر دورة لإدارة الاختبارات' : 'Select a course to manage tests'}
          </h2>
          <p className="empty-state-description">
            {i18n.language === 'ar' 
              ? 'اختر دورة من القائمة أعلاه لبدء إدارة اختبارات التنسيب والاختبارات النهائية'
              : 'Choose a course from the dropdown above to start managing placement tests and final assessments'
            }
          </p>
        </motion.div>
      )}

      {/* Tests Sections */}
      {selectedCourse && (
        <AnimatePresence>
          <motion.div
            key={selectedCourse.id}
            className="tests-sections-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Placement Test Section */}
            <motion.div
              className="test-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="test-section-header">
                <div className="test-icon placement-icon">
                  <FaCheckCircle />
                </div>
                <h3>
                  {i18n.language === 'ar' ? 'اختبار التنسيب' : 'Placement Test'}
              </h3>
              </div>

              {testLoading ? (
                <div className="tests-loading">
                  <div className="tests-loading-spinner"></div>
                  <p>{i18n.language === 'ar' ? 'جاري تحميل معلومات الاختبار...' : 'Loading test information...'}</p>
                </div>
              ) : testError ? (
                <div className="tests-error">
                  <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                  {testError}
                </div>
              ) : placementTest ? (
                <>
                  <div className="test-info">
                    <div className="test-info-title">{placementTest.title}</div>
                    <div className="test-info-description">{placementTest.description}</div>
                  </div>
                  
                  <div className="test-actions">
                    <motion.button
                      className="test-action-btn secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openTestModal('placement', 'edit', placementTest)}
                    >
                      <FaEdit />
                      {t('common.edit')}
                    </motion.button>
                    <motion.button
                      className="test-action-btn danger"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteModal({ isOpen: true, type: 'placement', test: placementTest })}
                    >
                      <FaTrash />
                      {t('common.delete')}
                    </motion.button>
                  </div>

                  {/* Questions Section */}
                  <div className="questions-section">
                    <h4>
                      <FaQuestionCircle />
                      {i18n.language === 'ar' ? 'الأسئلة' : 'Questions'}
                    </h4>
                    
                    {questionsLoading ? (
                      <div className="tests-loading">
                        <div className="tests-loading-spinner"></div>
                        <p>{i18n.language === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}</p>
                      </div>
                    ) : questionsError ? (
                      <div className="tests-error">
                        <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                        {questionsError}
                      </div>
                    ) : (
                      <>
                        <motion.button
                          className="add-question-btn"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openQuestionModal('placement', 'add', placementTest.id)}
                        >
                          <FaPlus />
                          {i18n.language === 'ar' ? 'إضافة سؤال' : 'Add Question'}
                        </motion.button>
                        
                        {placementQuestions.length === 0 ? (
                          <div className="no-questions">
                            <div className="no-questions-icon">
                              <FaQuestionCircle />
                            </div>
                            <div className="no-questions-text">
                              {i18n.language === 'ar' ? 'لا توجد أسئلة بعد.' : 'No questions yet.'}
                            </div>
                          </div>
                        ) : (
                          <ul className="questions-list">
                            {placementQuestions.map(q => (
                              <motion.li
                                key={q.id}
                                className="question-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="question-content">
                                  <span className={`question-type-badge ${q.type.toLowerCase()}`}>
                                    {getQuestionTypeIcon(q.type)}
                                  </span>
                                  <span className="question-text">{q.question}</span>
                                </div>
                                <div className="question-actions">
                                  <motion.button
                                    className="question-action-btn edit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openQuestionModal('placement', 'edit', placementTest.id, q)}
                                  >
                                    <FaEdit />
                                  </motion.button>
                                  <motion.button
                                    className="question-action-btn delete"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeleteQuestion('placement', placementTest.id, q.id)}
                                  >
                                    <FaTrash />
                                  </motion.button>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <motion.button
                  className="test-action-btn primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openTestModal('placement', 'add')}
                >
                  <FaPlus />
                  {i18n.language === 'ar' ? 'إضافة اختبار تنسيب' : 'Add Placement Test'}
                </motion.button>
              )}
            </motion.div>

            {/* Final Test Section */}
            <motion.div
              className="test-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="test-section-header">
                <div className="test-icon final-icon">
                  <FaCode />
                </div>
                <h3>
                  {i18n.language === 'ar' ? 'الاختبار النهائي / المشروع' : 'Final Test / Project'}
              </h3>
              </div>

              {testLoading ? (
                <div className="tests-loading">
                  <div className="tests-loading-spinner"></div>
                  <p>{i18n.language === 'ar' ? 'جاري تحميل معلومات الاختبار...' : 'Loading test information...'}</p>
                </div>
              ) : testError ? (
                <div className="tests-error">
                  <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                  {testError}
                </div>
              ) : finalTest ? (
                <>
                  <div className="test-info">
                    <div className="test-info-title">{finalTest.title}</div>
                    <div className="test-info-description">{finalTest.description}</div>
                  </div>
                  
                  <div className="test-actions">
                    <motion.button
                      className="test-action-btn secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openTestModal('final', 'edit', finalTest)}
                    >
                      <FaEdit />
                      {t('common.edit')}
                    </motion.button>
                    <motion.button
                      className="test-action-btn danger"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteModal({ isOpen: true, type: 'final', test: finalTest })}
                    >
                      <FaTrash />
                      {t('common.delete')}
                    </motion.button>
                  </div>

                  {/* Questions Section */}
                  <div className="questions-section">
                    <h4>
                      <FaQuestionCircle />
                      {i18n.language === 'ar' ? 'الأسئلة' : 'Questions'}
                    </h4>
                    
                    {questionsLoading ? (
                      <div className="tests-loading">
                        <div className="tests-loading-spinner"></div>
                        <p>{i18n.language === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}</p>
                      </div>
                    ) : questionsError ? (
                      <div className="tests-error">
                        <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                        {questionsError}
                      </div>
                    ) : (
                      <>
                        <motion.button
                          className="add-question-btn"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openQuestionModal('final', 'add', finalTest.id)}
                        >
                          <FaPlus />
                          {i18n.language === 'ar' ? 'إضافة سؤال' : 'Add Question'}
                        </motion.button>
                        
                        {finalQuestions.length === 0 ? (
                          <div className="no-questions">
                            <div className="no-questions-icon">
                              <FaQuestionCircle />
                            </div>
                            <div className="no-questions-text">
                              {i18n.language === 'ar' ? 'لا توجد أسئلة بعد.' : 'No questions yet.'}
                            </div>
                          </div>
                        ) : (
                          <ul className="questions-list">
                            {finalQuestions.map(q => (
                              <motion.li
                                key={q.id}
                                className="question-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="question-content">
                                  <span className={`question-type-badge ${q.type.toLowerCase()}`}>
                                    {getQuestionTypeIcon(q.type)}
                                  </span>
                                  <span className="question-text">{q.question}</span>
                                </div>
                                <div className="question-actions">
                                  <motion.button
                                    className="question-action-btn edit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openQuestionModal('final', 'edit', finalTest.id, q)}
                                  >
                                    <FaEdit />
                                  </motion.button>
                                  <motion.button
                                    className="question-action-btn delete"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeleteQuestion('final', finalTest.id, q.id)}
                                  >
                                    <FaTrash />
                                  </motion.button>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <motion.button
                  className="test-action-btn primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openTestModal('final', 'add')}
                >
                  <FaPlus />
                  {i18n.language === 'ar' ? 'إضافة اختبار نهائي' : 'Add Final Test'}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Success Message */}
      {successMsg && (
        <motion.div
          className="tests-success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {successMsg}
        </motion.div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: '', test: null })}
        onConfirm={handleDeleteTest}
        title={`Delete ${deleteModal.type === 'placement' ? 'Placement' : 'Final'} Test`}
        message={`Are you sure you want to delete this ${deleteModal.type === 'placement' ? 'placement' : 'final'} test? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Test Add/Edit Modal */}
      {testModal.isOpen && (
        <div className="confirmation-modal-overlay" style={{ zIndex: 1000 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="confirmation-modal-container"
            style={{ maxWidth: 420 }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleTestFormSubmit}>
              <div className="confirmation-modal-header">
                <h3 className="confirmation-modal-title">
                  {testModal.mode === 'add' 
                    ? `${i18n.language === 'ar' ? 'إضافة' : 'Add'} ${testModal.type === 'placement' ? (i18n.language === 'ar' ? 'اختبار تنسيب' : 'Placement Test') : (i18n.language === 'ar' ? 'اختبار نهائي' : 'Final Test')}`
                    : `${i18n.language === 'ar' ? 'تعديل' : 'Edit'} ${testModal.type === 'placement' ? (i18n.language === 'ar' ? 'اختبار تنسيب' : 'Placement Test') : (i18n.language === 'ar' ? 'اختبار نهائي' : 'Final Test')}`
                  }
                </h3>
                <button className="confirmation-modal-close-btn" onClick={closeTestModal} type="button">
                  <span>&times;</span>
                </button>
              </div>
              <div className="confirmation-modal-content">
                <label>
                  {i18n.language === 'ar' ? 'العنوان' : 'Title'}
                </label>
                <input 
                  ref={testTitleRef} 
                  name="title" 
                  value={testForm.title} 
                  onChange={handleTestFormChange} 
                  required 
                  disabled={testFormLoading}
                  placeholder={i18n.language === 'ar' ? 'أدخل عنوان الاختبار...' : 'Enter test title...'}
                />
                <label>
                  {i18n.language === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <textarea 
                  name="description" 
                  value={testForm.description} 
                  onChange={handleTestFormChange} 
                  rows={3} 
                  disabled={testFormLoading}
                  placeholder={i18n.language === 'ar' ? 'أدخل وصف الاختبار...' : 'Enter test description...'}
                />
              </div>
              <div className="confirmation-modal-actions">
                <motion.button 
                  type="button" 
                  className="confirmation-modal-cancel-btn" 
                  onClick={closeTestModal} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  disabled={testFormLoading}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button 
                  type="submit" 
                  className="confirmation-modal-confirm-btn" 
                  style={{ background: testModal.type === 'placement' ? '#A97C78' : '#C89F9C', color: '#fff' }} 
                  whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }} 
                  whileTap={{ scale: 0.98 }} 
                  disabled={testFormLoading}
                >
                  {testFormLoading ? (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (testModal.mode === 'add' ? (i18n.language === 'ar' ? 'إضافة' : 'Add') : (i18n.language === 'ar' ? 'حفظ' : 'Save'))}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {questionModal.isOpen && (
        <div className="confirmation-modal-overlay" style={{ zIndex: 1000 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="confirmation-modal-container"
            style={{ maxWidth: 520 }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleQuestionFormSubmit}>
              <div className="confirmation-modal-header">
                <h3 className="confirmation-modal-title">
                  {questionModal.mode === 'add' ? (i18n.language === 'ar' ? 'إضافة سؤال' : 'Add Question') : (i18n.language === 'ar' ? 'تعديل سؤال' : 'Edit Question')}
                </h3>
                <button className="confirmation-modal-close-btn" onClick={closeQuestionModal} type="button">
                  <span>&times;</span>
                </button>
              </div>
              <div className="confirmation-modal-content">
                <label>
                  {i18n.language === 'ar' ? 'النوع' : 'Type'}
                </label>
                <select 
                  name="type" 
                  value={questionForm.type} 
                  onChange={handleQuestionFormChange} 
                  required 
                  disabled={questionFormLoading}
                >
                  <option value="mcq">{i18n.language === 'ar' ? 'اختيار متعدد' : 'MCQ'}</option>
                  <option value="true_false">{i18n.language === 'ar' ? 'صح/خطأ' : 'True/False'}</option>
                  <option value="code">{i18n.language === 'ar' ? 'برمجة' : 'Code'}</option>
                </select>
                
                <label>
                  {i18n.language === 'ar' ? 'السؤال' : 'Question'}
                </label>
                <textarea 
                  name="question" 
                  value={questionForm.question} 
                  onChange={handleQuestionFormChange} 
                  rows={2} 
                  required 
                  disabled={questionFormLoading}
                  placeholder={i18n.language === 'ar' ? 'أدخل السؤال...' : 'Enter question...'}
                />
                
                {questionForm.type === 'mcq' && (
                  <>
                    <label>
                      {i18n.language === 'ar' ? 'الخيارات' : 'Options'}
                    </label>
                  {questionForm.options.map((opt, idx) => (
                      <div key={idx} className="option-item">
                        <input 
                          value={opt} 
                          onChange={e => handleOptionChange(idx, e.target.value)} 
                          required 
                          disabled={questionFormLoading}
                          placeholder={i18n.language === 'ar' ? `الخيار ${idx + 1}...` : `Option ${idx + 1}...`}
                        />
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => removeOption(idx)} 
                          disabled={questionFormLoading || questionForm.options.length <= 1}
                        >
                          &times;
                        </button>
                    </div>
                  ))}
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={addOption} 
                      disabled={questionFormLoading}
                    >
                      <FaPlus />
                      {i18n.language === 'ar' ? 'إضافة خيار' : 'Add Option'}
                    </button>
                  </>
                )}
                
                {questionForm.type === 'true_false' && (
                  <>
                    <label>
                      {i18n.language === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
                    </label>
                    <select 
                      name="correct_answer" 
                      value={questionForm.correct_answer} 
                      onChange={handleQuestionFormChange} 
                      required 
                      disabled={questionFormLoading}
                    >
                      <option value="">{i18n.language === 'ar' ? 'اختر' : 'Select'}</option>
                      <option value="True">{i18n.language === 'ar' ? 'صح' : 'True'}</option>
                      <option value="False">{i18n.language === 'ar' ? 'خطأ' : 'False'}</option>
                  </select>
                  </>
                )}
                
                {questionForm.type === 'mcq' && (
                  <>
                    <label>
                      {i18n.language === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
                    </label>
                    <input 
                      name="correct_answer" 
                      value={questionForm.correct_answer} 
                      onChange={handleQuestionFormChange} 
                      required 
                      disabled={questionFormLoading}
                      placeholder={i18n.language === 'ar' ? 'أدخل الإجابة الصحيحة...' : 'Enter correct answer...'}
                    />
                  </>
                )}
                
                {questionForm.type === 'code' && (
                  <>
                    <label>
                      {i18n.language === 'ar' ? 'قالب الكود' : 'Code Template'}
                    </label>
                    <textarea 
                      name="code_template" 
                      value={questionForm.code_template} 
                      onChange={handleQuestionFormChange} 
                      rows={3} 
                      disabled={questionFormLoading}
                      placeholder={i18n.language === 'ar' ? 'أدخل قالب الكود...' : 'Enter code template...'}
                    />
                    <label>
                      {i18n.language === 'ar' ? 'حالات الاختبار' : 'Test Cases'}
                    </label>
                  {questionForm.test_cases.map((tc, idx) => (
                      <div key={idx} className="test-case-item">
                        <input 
                          value={tc} 
                          onChange={e => handleTestCaseChange(idx, e.target.value)} 
                          required 
                          disabled={questionFormLoading}
                          placeholder={i18n.language === 'ar' ? `حالة الاختبار ${idx + 1}...` : `Test case ${idx + 1}...`}
                        />
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => removeTestCase(idx)} 
                          disabled={questionFormLoading || questionForm.test_cases.length <= 1}
                        >
                          &times;
                        </button>
                    </div>
                  ))}
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={addTestCase} 
                      disabled={questionFormLoading}
                    >
                      <FaPlus />
                      {i18n.language === 'ar' ? 'إضافة حالة اختبار' : 'Add Test Case'}
                    </button>
                    <label>
                      {i18n.language === 'ar' ? 'الإجابة الصحيحة' : 'Correct Answer'}
                    </label>
                    <input 
                      name="correct_answer" 
                      value={questionForm.correct_answer} 
                      onChange={handleQuestionFormChange} 
                      required 
                      disabled={questionFormLoading}
                      placeholder={i18n.language === 'ar' ? 'أدخل الإجابة الصحيحة...' : 'Enter correct answer...'}
                    />
                  </>
                )}
                
                <label>
                  {i18n.language === 'ar' ? 'الصعوبة' : 'Difficulty'}
                </label>
                <input 
                  name="difficulty" 
                  value={questionForm.difficulty} 
                  onChange={handleQuestionFormChange} 
                  disabled={questionFormLoading}
                  placeholder={i18n.language === 'ar' ? 'مثال: سهل، متوسط، صعب...' : 'e.g., Easy, Medium, Hard...'}
                />
              </div>
              <div className="confirmation-modal-actions">
                <motion.button 
                  type="button" 
                  className="confirmation-modal-cancel-btn" 
                  onClick={closeQuestionModal} 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  disabled={questionFormLoading}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button 
                  type="submit" 
                  className="confirmation-modal-confirm-btn" 
                  style={{ background: questionModal.type === 'placement' ? '#A97C78' : '#C89F9C', color: '#fff' }} 
                  whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }} 
                  whileTap={{ scale: 0.98 }} 
                  disabled={questionFormLoading}
                >
                  {questionFormLoading 
                    ? (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                    : (questionModal.mode === 'add' ? (i18n.language === 'ar' ? 'إضافة' : 'Add') : (i18n.language === 'ar' ? 'حفظ' : 'Save'))
                  }
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TestsDashboard; 