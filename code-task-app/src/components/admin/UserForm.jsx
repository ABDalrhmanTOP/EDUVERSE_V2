// src/components/UserForm.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaUniversity, FaHeart, FaTimes, FaBuilding, FaCode, FaChalkboardTeacher, FaFlask } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/axios';
import '../../styles/admin/UserForm.css';

const emptyUser = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  job: '',
  country: '',
  experience: '',
  semester: '',
  career_goals: '',
  hobbies: [],
  expectations: [],
  university: '',
  education_level: '',
  field_of_study: '',
  student_year: '',
  years_of_experience: '',
  specialization: '',
  industry: '',
  company_size: '',
  teaching_subject: '',
  research_field: '',
  has_completed_general_form: false
};

const UserForm = ({ editingUser, onSuccess, onClose }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(emptyUser);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingUser) {
      setUser({
        name: editingUser.name || '',
        email: editingUser.email || '',
        username: editingUser.username || '',
        password: '',
        confirmPassword: '',
        role: editingUser.role || 'user',
        job: editingUser.job || '',
        country: editingUser.country || '',
        experience: editingUser.experience || '',
        semester: editingUser.semester || '',
        career_goals: editingUser.career_goals || '',
        hobbies: editingUser.hobbies ? (typeof editingUser.hobbies === 'string' ? JSON.parse(editingUser.hobbies) : editingUser.hobbies) : [],
        expectations: editingUser.expectations ? (typeof editingUser.expectations === 'string' ? JSON.parse(editingUser.expectations) : editingUser.expectations) : [],
        university: editingUser.university || '',
        education_level: editingUser.education_level || '',
        field_of_study: editingUser.field_of_study || '',
        student_year: editingUser.student_year || '',
        years_of_experience: editingUser.years_of_experience || '',
        specialization: editingUser.specialization || '',
        industry: editingUser.industry || '',
        company_size: editingUser.company_size || '',
        teaching_subject: editingUser.teaching_subject || '',
        research_field: editingUser.research_field || '',
        has_completed_general_form: editingUser.has_completed_general_form || false
      });
    } else {
      setUser(emptyUser);
    }
    setErrors({});
  }, [editingUser]);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({ 
      ...user, 
      [name]: type === 'checkbox' ? checked : value 
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleArrayChange = (field, value) => {
    setUser({ ...user, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!user.name) newErrors.name = t('admin.forms.validation.required');
    if (!user.email) newErrors.email = t('admin.forms.validation.required');
    else if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = t('admin.forms.validation.email');
    if (!user.username) newErrors.username = t('admin.forms.validation.required');

    if (!editingUser || user.password) {
      if (!user.password) newErrors.password = t('admin.forms.validation.required');
      else if (user.password.length < 6) newErrors.password = t('admin.forms.validation.minLength', { min: 6 });
      if (user.password !== user.confirmPassword) newErrors.confirmPassword = t('admin.forms.validation.passwordMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const userDataToSend = {
      name: user.name,
      email: user.email,
      role: user.role,
      job: user.job || null,
      country: user.country || null,
      experience: user.experience || null,
      semester: user.semester ? parseInt(user.semester) : null,
      career_goals: user.career_goals || null,
      hobbies: user.hobbies,
      expectations: user.expectations,
      university: user.university || null,
      education_level: user.education_level || null,
      field_of_study: user.field_of_study || null,
      student_year: user.student_year || null,
      years_of_experience: user.years_of_experience || null,
      specialization: user.specialization || null,
      industry: user.industry || null,
      company_size: user.company_size || null,
      teaching_subject: user.teaching_subject || null,
      research_field: user.research_field || null,
      has_completed_general_form: user.has_completed_general_form
    };

    if (user.password) {
      userDataToSend.password = user.password;
    }

    try {
      if (editingUser) {
        const response = await apiClient.put(`/admin/users/${editingUser.id}`, userDataToSend);
        onSuccess(response.data.user);
        setSuccessMessage(t('admin.users.userUpdatedSuccess'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        await apiClient.post('/admin/users', userDataToSend);
        onSuccess(t('admin.users.userAddedSuccess'));
      }
      onClose();
    } catch (error) {
      setError(t('admin.users.failedToUpdateUser'));
    } finally {
      setLoading(false);
    }
  };

  const getJobIcon = (job) => {
    switch (job) {
      case 'Student':
        return <FaGraduationCap />;
      case 'Software Engineer':
        return <FaCode />;
      case 'Teacher':
        return <FaChalkboardTeacher />;
      case 'Researcher':
        return <FaFlask />;
      default:
        return <FaBuilding />;
    }
  };

  const tabs = [
    { id: 'basic', label: t('admin.users.basicInformation'), icon: <FaUser /> },
    { id: 'professional', label: t('admin.users.professionalInformation'), icon: <FaBriefcase /> },
    { id: 'education', label: t('admin.users.educationInformation'), icon: <FaGraduationCap /> },
    { id: 'personal', label: t('admin.users.personalInformation'), icon: <FaHeart /> }
  ];

  return (
    <div className="user-form-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="user-form-modal"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="user-form-header">
          <h2>{editingUser ? t('admin.users.editUser') : t('admin.users.addUser')}</h2>
          <button onClick={onClose} className="user-form-close-btn">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {/* Tabs */}
          <div className="user-form-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`user-form-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="user-form-content">
            {activeTab === 'basic' && (
              <div className="user-form-section">
                <div className="form-group">
                  <label>{t('admin.users.fullName')} *</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterFullName')}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>{t('admin.users.email')} *</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterEmail')}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>{t('admin.users.username')} *</label>
                  <input
                    type="text"
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterUsername')}
                    className={errors.username ? 'error' : ''}
                  />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('admin.users.password')} {!editingUser && '*'}</label>
                    <input
                      type="password"
                      name="password"
                      value={user.password}
                      onChange={handleChange}
                      placeholder={t('admin.forms.placeholders.enterPassword')}
                      className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>{t('admin.users.confirmPassword')} {!editingUser && '*'}</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={user.confirmPassword}
                      onChange={handleChange}
                      placeholder={t('admin.forms.placeholders.confirmPassword')}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('admin.users.role')} *</label>
                  <select name="role" value={user.role} onChange={handleChange}>
                    <option value="user">{t('admin.forms.options.roles.user')}</option>
                    <option value="admin">{t('admin.forms.options.roles.admin')}</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="user-form-section">
                <div className="form-group">
                  <label>{t('admin.users.jobTitle')}</label>
                  <select name="job" value={user.job} onChange={handleChange}>
                    <option value="">{t('admin.forms.placeholders.selectJobTitle')}</option>
                    <option value="Student">{t('admin.forms.options.jobTitles.student')}</option>
                    <option value="Software Engineer">{t('admin.forms.options.jobTitles.softwareEngineer')}</option>
                    <option value="Teacher">{t('admin.forms.options.jobTitles.teacher')}</option>
                    <option value="Researcher">{t('admin.forms.options.jobTitles.researcher')}</option>
                    <option value="Other">{t('admin.forms.options.jobTitles.other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('admin.users.experienceLevel')}</label>
                  <select name="experience" value={user.experience} onChange={handleChange}>
                    <option value="">{t('admin.forms.placeholders.selectExperienceLevel')}</option>
                    <option value="Beginner">{t('admin.forms.options.experienceLevels.beginner')}</option>
                    <option value="Intermediate">{t('admin.forms.options.experienceLevels.intermediate')}</option>
                    <option value="Advanced">{t('admin.forms.options.experienceLevels.advanced')}</option>
                    <option value="Expert">{t('admin.forms.options.experienceLevels.expert')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('admin.users.yearsOfExperience')}</label>
                  <input
                    type="number"
                    name="years_of_experience"
                    value={user.years_of_experience}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterYearsOfExperience')}
                    min="0"
                    max="50"
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.specialization')}</label>
                  <input
                    type="text"
                    name="specialization"
                    value={user.specialization}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterSpecialization')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.industry')}</label>
                  <input
                    type="text"
                    name="industry"
                    value={user.industry}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterIndustry')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.companySize')}</label>
                  <select name="company_size" value={user.company_size} onChange={handleChange}>
                    <option value="">{t('admin.forms.placeholders.selectCompanySize')}</option>
                    <option value="Small">{t('admin.forms.options.companySizes.small')}</option>
                    <option value="Medium">{t('admin.forms.options.companySizes.medium')}</option>
                    <option value="Large">{t('admin.forms.options.companySizes.large')}</option>
                    <option value="Enterprise">{t('admin.forms.options.companySizes.enterprise')}</option>
                    <option value="Corporate">{t('admin.forms.options.companySizes.corporate')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('admin.users.teachingSubject')}</label>
                  <input
                    type="text"
                    name="teaching_subject"
                    value={user.teaching_subject}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterTeachingSubject')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.researchField')}</label>
                  <input
                    type="text"
                    name="research_field"
                    value={user.research_field}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterResearchField')}
                  />
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="user-form-section">
                <div className="form-group">
                  <label>{t('admin.users.university')}</label>
                  <input
                    type="text"
                    name="university"
                    value={user.university}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterUniversity')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.educationLevel')}</label>
                  <select name="education_level" value={user.education_level} onChange={handleChange}>
                    <option value="">{t('admin.forms.placeholders.selectEducationLevel')}</option>
                    <option value="High School">{t('admin.forms.options.educationLevels.highSchool')}</option>
                    <option value="Bachelor's">{t('admin.forms.options.educationLevels.bachelors')}</option>
                    <option value="Master's">{t('admin.forms.options.educationLevels.masters')}</option>
                    <option value="PhD">{t('admin.forms.options.educationLevels.phd')}</option>
                    <option value="Other">{t('admin.forms.options.educationLevels.other')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('admin.users.fieldOfStudy')}</label>
                  <input
                    type="text"
                    name="field_of_study"
                    value={user.field_of_study}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterFieldOfStudy')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.studentYear')}</label>
                  <select name="student_year" value={user.student_year} onChange={handleChange}>
                    <option value="">{t('admin.forms.placeholders.selectStudentYear')}</option>
                    <option value="1st Year">{t('admin.forms.options.studentYears.firstYear')}</option>
                    <option value="2nd Year">{t('admin.forms.options.studentYears.secondYear')}</option>
                    <option value="3rd Year">{t('admin.forms.options.studentYears.thirdYear')}</option>
                    <option value="4th Year">{t('admin.forms.options.studentYears.fourthYear')}</option>
                    <option value="Graduate">{t('admin.forms.options.studentYears.graduate')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('admin.users.semester')}</label>
                  <select name="semester" value={user.semester} onChange={handleChange}>
                    <option value="">{t('admin.forms.placeholders.selectSemester')}</option>
                    <option value="1st Semester">{t('admin.forms.options.semesters.firstSemester')}</option>
                    <option value="2nd Semester">{t('admin.forms.options.semesters.secondSemester')}</option>
                    <option value="Summer">{t('admin.forms.options.semesters.summer')}</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="user-form-section">
                <div className="form-group">
                  <label>{t('admin.users.country')}</label>
                  <input
                    type="text"
                    name="country"
                    value={user.country}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.enterCountry')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.careerGoals')}</label>
                  <textarea
                    name="career_goals"
                    value={user.career_goals}
                    onChange={handleChange}
                    placeholder={t('admin.forms.placeholders.describeCareerGoals')}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.hobbies')}</label>
                  <textarea
                    name="hobbies"
                    value={Array.isArray(user.hobbies) ? user.hobbies.join(', ') : user.hobbies}
                    onChange={(e) => handleArrayChange('hobbies', e.target.value.split(',').map(h => h.trim()).filter(h => h))}
                    placeholder="e.g., Reading, Swimming, Coding"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>{t('admin.users.expectations')}</label>
                  <textarea
                    name="expectations"
                    value={Array.isArray(user.expectations) ? user.expectations.join(', ') : user.expectations}
                    onChange={(e) => handleArrayChange('expectations', e.target.value.split(',').map(exp => exp.trim()).filter(exp => exp))}
                    placeholder="e.g., Learn new skills, Network with professionals"
                    rows="3"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="has_completed_general_form"
                      checked={user.has_completed_general_form}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    {t('admin.users.hasCompletedGeneralForm')}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="user-form-actions">
            <button type="button" onClick={onClose} className="user-form-cancel-btn">
              {t('common.cancel')}
            </button>
            <button type="submit" className="user-form-save-btn" disabled={loading}>
              {loading ? t('common.saving') : (editingUser ? t('common.update') : t('common.save'))}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserForm;