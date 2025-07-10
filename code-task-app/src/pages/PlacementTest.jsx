import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import "../styles/PlacementTest.css";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const personalInitial = {
  job: "",
  university: "",
  country: "",
  experience: "",
  careerGoals: "",
  hobbies: [],
  expectations: [],
  // Dynamic fields
  educationLevel: "",
  fieldOfStudy: "",
  studentYear: "",
  yearsOfExperience: "",
  specialization: "",
  teachingSubject: "",
  researchField: "",
  companySize: "",
  industry: "",
};

const jobOptions = [
  "Student",
  "Software Engineer",
  "Teacher",
  "Researcher",
  "Unemployed",
  "Other"
];

const educationLevelOptions = [
  "High School",
  "University",
  "Master's",
  "PhD",
  "Other"
];

const fieldOfStudyOptions = [
  "Computer Science",
  "Engineering",
  "Mathematics",
  "Physics",
  "Business",
  "Arts",
  "Medicine",
  "Other"
];

const specializationOptions = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cybersecurity",
  "Other"
];

const teachingSubjectOptions = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Other"
];

const researchFieldOptions = [
  "Computer Science",
  "Artificial Intelligence",
  "Data Science",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "Other"
];

const companySizeOptions = [
  "Startup (1-10 employees)",
  "Small (11-50 employees)",
  "Medium (51-200 employees)",
  "Large (200+ employees)",
  "Enterprise (1000+ employees)"
];

const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Government",
  "Other"
];

const countryOptions = [
  "Algeria", "Austria", "Bahrain", "Belgium", "Bulgaria", "Comoros", "Croatia", "Czech Republic", "Denmark", "Egypt", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Iraq", "Italy", "Jordan", "Kuwait", "Latvia", "Lebanon", "Libya", "Lithuania", "Mauritania", "Morocco", "Netherlands", "Norway", "Oman", "Palestine", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia", "Slovakia", "Slovenia", "Somalia", "Spain", "Sudan", "Sweden", "Switzerland", "Syria", "Tunisia", "Ukraine", "United Arab Emirates", "United Kingdom", "Yemen",
  "Other"
];
const experienceOptions = [
  "Newbie (No experience)",
  "Some experience",
  "Advanced",
  "Other"
];

const careerGoalsOptions = [
  "Become a Software Engineer",
  "Become a Data Scientist",
  "Become a Web Developer",
  "Become a Mobile Developer",
  "Become a DevOps Engineer",
  "Become a Cybersecurity Expert",
  "Become a Machine Learning Engineer",
  "Become a UI/UX Designer",
  "Become a Product Manager",
  "Become a Technical Lead",
  "Become a Researcher",
  "Become a Teacher/Instructor",
  "Start my own tech company",
  "Improve my programming skills",
  "Switch careers to tech",
  "Get a promotion in my current role",
  "Learn for personal interest",
  "Other"
];

const hobbiesOptions = [
  "Reading",
  "Coding/Programming",
  "Gaming",
  "Sports (Football, Basketball, etc.)",
  "Music",
  "Travel",
  "Photography",
  "Cooking",
  "Art/Drawing",
  "Gym/Working out",
  "Watching movies/TV shows",
  "Playing musical instruments",
  "Hiking/Outdoor activities",
  "Puzzle solving",
  "Chess",
  "Blogging/Writing",
  "Social media",
  "Learning new languages",
  "DIY projects",
  "Other"
];

const expectationsOptions = [
  "Learn practical programming skills",
  "Get hands-on project experience",
  "Understand theoretical concepts",
  "Prepare for job interviews",
  "Build a portfolio of projects",
  "Network with other developers",
  "Get mentorship from experts",
  "Learn industry best practices",
  "Stay updated with latest technologies",
  "Improve problem-solving skills",
  "Learn to work in teams",
  "Get certification",
  "Build real-world applications",
  "Learn from scratch",
  "Advance my current knowledge",
  "Other"
];

const PlacementTest = ({ onComplete }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState({
    job: "",
    university: "",
    country: "",
    experience: "",
    careerGoals: "",
    hobbies: [],
    expectations: [],
    educationLevel: "",
    fieldOfStudy: "",
    studentYear: "",
    yearsOfExperience: "",
    specialization: "",
    teachingSubject: "",
    researchField: "",
    companySize: "",
    industry: "",
  });
  const [personalError, setPersonalError] = useState("");
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [academicError, setAcademicError] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [testError, setTestError] = useState("");
  const [skipPlacementTest, setSkipPlacementTest] = useState(false);
  const [showPlacementChoice, setShowPlacementChoice] = useState(false);
  const [hasCompletedGeneralForm, setHasCompletedGeneralForm] = useState(false);
  const [testId, setTestId] = useState(null);
  
  // Individual field error states
  const [fieldErrors, setFieldErrors] = useState({
    job: "",
    country: "",
    experience: "",
    careerGoals: "",
    hobbies: "",
    expectations: "",
    university: "",
    educationLevel: "",
    fieldOfStudy: "",
    studentYear: "",
    yearsOfExperience: "",
    specialization: "",
    teachingSubject: "",
    researchField: "",
    companySize: "",
    industry: "",
    semester: ""
  });
  
  // Custom dropdown states
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showSemesterDropdown, setShowSemesterDropdown] = useState(false);
  
  // Dynamic dropdown states
  const [showEducationLevelDropdown, setShowEducationLevelDropdown] = useState(false);
  const [showFieldOfStudyDropdown, setShowFieldOfStudyDropdown] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);
  const [showTeachingSubjectDropdown, setShowTeachingSubjectDropdown] = useState(false);
  const [showResearchFieldDropdown, setShowResearchFieldDropdown] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCareerGoalsDropdown, setShowCareerGoalsDropdown] = useState(false);
  const [showHobbiesDropdown, setShowHobbiesDropdown] = useState(false);
  const [showExpectationsDropdown, setShowExpectationsDropdown] = useState(false);
  
  // Keyboard search states
  const [jobSearch, setJobSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [experienceSearch, setExperienceSearch] = useState("");
  const [educationLevelSearch, setEducationLevelSearch] = useState("");
  const [fieldOfStudySearch, setFieldOfStudySearch] = useState("");
  const [specializationSearch, setSpecializationSearch] = useState("");
  const [teachingSubjectSearch, setTeachingSubjectSearch] = useState("");
  const [researchFieldSearch, setResearchFieldSearch] = useState("");
  const [companySizeSearch, setCompanySizeSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [careerGoalsSearch, setCareerGoalsSearch] = useState("");
  const [hobbiesSearch, setHobbiesSearch] = useState("");
  const [expectationsSearch, setExpectationsSearch] = useState("");

  // Monaco Editor theme state
  const [editorTheme, setEditorTheme] = useState("custom-dark");

  // Progress bar
  const totalSteps = 3; // Reduced to 3 steps
  const progress = Math.min((step - 1) / (totalSteps - 1), 1) * 100;

  // Fade-in/fade-out transitions
  const [fade, setFade] = useState(true);
  const nextStep = () => {
    setFade(false);
    setTimeout(() => {
      setStep(s => s + 1);
      setFade(true);
    }, 200);
  };

  const prevStep = () => {
    setFade(false);
    setTimeout(() => {
      setStep(s => s - 1);
      setFade(true);
    }, 200);
  };

  // Comprehensive field validation
  const validateFields = () => {
    const newFieldErrors = {
      job: "",
      country: "",
      experience: "",
      careerGoals: "",
      hobbies: "",
      expectations: "",
      university: "",
      educationLevel: "",
      fieldOfStudy: "",
      studentYear: "",
      yearsOfExperience: "",
      specialization: "",
      teachingSubject: "",
      researchField: "",
      companySize: "",
      industry: "",
      semester: ""
    };

    // Basic required fields (always shown)
    if (!personal.job) newFieldErrors.job = "Please select your job/role";
    if (!personal.country) newFieldErrors.country = "Please select your country";
    if (!personal.experience) newFieldErrors.experience = "Please select your experience level";
    if (!personal.careerGoals?.trim()) newFieldErrors.careerGoals = "Please describe your career goals";
    if (!personal.hobbies || personal.hobbies.length === 0) newFieldErrors.hobbies = "Please select at least one hobby";
    if (!personal.expectations || personal.expectations.length === 0) newFieldErrors.expectations = "Please select at least one expectation";

    // Only validate dynamic fields if a job is selected
    if (personal.job) {
      // University field - only required for non-students
      if (personal.job !== "Student" && !personal.university?.trim()) {
        newFieldErrors.university = "Please enter your university name";
      }

      // Dynamic validation based on job
      if (personal.job === "Student") {
        if (!personal.educationLevel) newFieldErrors.educationLevel = "Please select your education level";
        if ((personal.educationLevel === "University" || personal.educationLevel === "Master's" || personal.educationLevel === "PhD") && !personal.fieldOfStudy) {
          newFieldErrors.fieldOfStudy = "Please select your field of study";
        }
        if (personal.educationLevel === "University" && !personal.studentYear) {
          newFieldErrors.studentYear = "Please select your university year";
        }
      } else if (personal.job === "Software Engineer") {
        if (!personal.yearsOfExperience) newFieldErrors.yearsOfExperience = "Please select your years of experience";
        if (!personal.specialization) newFieldErrors.specialization = "Please select your specialization";
        if (!personal.industry) newFieldErrors.industry = "Please select your industry";
        if (!personal.companySize) newFieldErrors.companySize = "Please select your company size";
      } else if (personal.job === "Teacher") {
        if (!personal.teachingSubject) newFieldErrors.teachingSubject = "Please select your teaching subject";
      } else if (personal.job === "Researcher") {
        if (!personal.researchField) newFieldErrors.researchField = "Please select your research field";
      }
    }

    // Academic fields validation
    if (!semester) newFieldErrors.semester = "Please select semester";

    setFieldErrors(newFieldErrors);
    
    // Return true if there are any errors
    return Object.values(newFieldErrors).some(error => error !== "");
  };

  // Personal survey validation
  const handlePersonalNext = async () => {
    const hasErrors = validateFields();
    
    if (hasErrors) {
      return;
    }
    
    setPersonalError("");
    setLoading(true);
    
    try {
      // Save profile information to database
      const profileData = {
        job: personal.job,
        university: personal.university || "",
        country: personal.country,
        experience: personal.experience,
        career_goals: personal.careerGoals || "",
        hobbies: personal.hobbies && personal.hobbies.length > 0 ? JSON.stringify(personal.hobbies) : "[]",
        expectations: personal.expectations && personal.expectations.length > 0 ? JSON.stringify(personal.expectations) : "[]",
        education_level: personal.educationLevel || "",
        field_of_study: personal.fieldOfStudy || "",
        student_year: personal.studentYear ? String(personal.studentYear) : "",
        years_of_experience: personal.yearsOfExperience || "",
        specialization: personal.specialization || "",
        teaching_subject: personal.teachingSubject || "",
        research_field: personal.researchField || "",
        company_size: personal.companySize || "",
        industry: personal.industry || "",
        semester: parseInt(semester),
      };
      
      console.log('Sending profile data:', profileData);
      
      await apiClient.post('/profile/general-form', profileData);
      
      // Show placement choice for ALL users
      setShowPlacementChoice(true);
    } catch (err) {
      console.error('Error saving profile:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.errors) {
        // Show specific validation errors
        const errorMessages = Object.values(err.response.data.errors).flat();
        setPersonalError(errorMessages.join(', '));
      } else {
        setPersonalError('Failed to save profile information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle placement test choice
  const handlePlacementChoice = async (choice) => {
    setShowPlacementChoice(false);
    if (choice === "placement") {
      setLoading(true);
      setTestError("");
      try {
        const res = await apiClient.post(`/placement-test/start`, {
          course_id: courseId,
        });
        setQuestions(res.data.questions || []);
        setSkipPlacementTest(false);
        setTestId(res.data.test_id);
        setStep(2); // Go to the test (not 3)
      } catch (err) {
        console.error("Error starting placement test:", err);
        setTestError("Failed to load placement test. Please try again or start from scratch.");
        setShowPlacementChoice(true); // Show choice again on error
      } finally {
        setLoading(false);
      }
    } else {
      setSkipPlacementTest(true);
      if (onComplete) onComplete(result, true);
      navigate(`/course/${courseId}`);
    }
  };

  // Academic survey
  const handleAcademicNext = async () => {
    const hasErrors = validateFields();
    
    if (hasErrors) {
      return;
    }
    
    setAcademicError("");
    setLoading(true);
    setTestError("");
    
    console.log('Starting placement test with:', {
      courseId,
      year,
      semester,
      personal
    });
    
    try {
      const res = await apiClient.post(`/placement-test/start`, {
        course_id: courseId,
        year,
        semester,
        ...personal,
      });
      console.log('API Response:', res.data);
      setQuestions(res.data.questions || []);
      nextStep();
    } catch (err) {
      console.error("Full API Error:", err);
      console.error("Error Response:", err.response);
      console.error("Error Data:", err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to load test questions. Please try again.";
      setTestError(errorMessage);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Test submission
  const handleSubmitTest = async () => {
    setLoading(true);
    try {
      // Convert answers object to the format expected by backend
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        question_id: parseInt(questionId),
        answer: answers[questionId]
      }));

      const res = await apiClient.post(`/placement-test/submit`, {
        test_id: testId,
        answers: formattedAnswers,
      });
      
      // Set result with the correct structure
      setResult({
        passed: res.data.percentage >= 70, // Assuming 70% is passing
        score: res.data.score,
        total: res.data.total,
        percentage: res.data.percentage
      });
      setStep(3); // Go to result page
      if (onComplete) onComplete();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to submit answers. Please try again.";
      setTestError(errorMessage);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Custom dropdown handlers
  const handleJobSelect = (job) => {
    setPersonal(p => ({ ...p, job }));
    setShowJobDropdown(false);
    setJobSearch("");
    // Clear job field error
    setFieldErrors(prev => ({ ...prev, job: "" }));
    // Clear dynamic fields when job changes
    setPersonal(p => ({
      ...p,
      educationLevel: "",
      fieldOfStudy: "",
      studentYear: "",
      yearsOfExperience: "",
      specialization: "",
      teachingSubject: "",
      researchField: "",
      companySize: "",
      industry: "",
    }));
    // Clear all dynamic field errors
    setFieldErrors(prev => ({
      ...prev,
      educationLevel: "",
      fieldOfStudy: "",
      studentYear: "",
      yearsOfExperience: "",
      specialization: "",
      teachingSubject: "",
      researchField: "",
      companySize: "",
      industry: "",
    }));
  };

  const handleCountrySelect = (country) => {
    setPersonal(p => ({ ...p, country }));
    setShowCountryDropdown(false);
    setCountrySearch("");
    setFieldErrors(prev => ({ ...prev, country: "" }));
  };

  const handleExperienceSelect = (experience) => {
    setPersonal(p => ({ ...p, experience }));
    setShowExperienceDropdown(false);
    setExperienceSearch("");
    setFieldErrors(prev => ({ ...prev, experience: "" }));
  };

  const handleYearSelect = (selectedYear) => {
    setYear(selectedYear);
    setShowYearDropdown(false);
  };

  const handleSemesterSelect = (selectedSemester) => {
    setSemester(selectedSemester);
    setShowSemesterDropdown(false);
    setFieldErrors(prev => ({ ...prev, semester: "" }));
  };

  // Dynamic dropdown handlers
  const handleEducationLevelSelect = (level) => {
    setPersonal(p => ({ ...p, educationLevel: level }));
    setShowEducationLevelDropdown(false);
    setEducationLevelSearch("");
    setFieldErrors(prev => ({ ...prev, educationLevel: "" }));
    if (level !== "University") {
      setPersonal(p => ({ ...p, studentYear: "" }));
      setFieldErrors(prev => ({ ...prev, studentYear: "" }));
    }
  };

  const handleFieldOfStudySelect = (field) => {
    setPersonal(p => ({ ...p, fieldOfStudy: field }));
    setShowFieldOfStudyDropdown(false);
    setFieldOfStudySearch("");
    setFieldErrors(prev => ({ ...prev, fieldOfStudy: "" }));
  };

  const handleSpecializationSelect = (specialization) => {
    setPersonal(p => ({ ...p, specialization }));
    setShowSpecializationDropdown(false);
    setSpecializationSearch("");
    setFieldErrors(prev => ({ ...prev, specialization: "" }));
  };

  const handleTeachingSubjectSelect = (subject) => {
    setPersonal(p => ({ ...p, teachingSubject: subject }));
    setShowTeachingSubjectDropdown(false);
    setTeachingSubjectSearch("");
    setFieldErrors(prev => ({ ...prev, teachingSubject: "" }));
  };

  const handleResearchFieldSelect = (field) => {
    setPersonal(p => ({ ...p, researchField: field }));
    setShowResearchFieldDropdown(false);
    setResearchFieldSearch("");
    setFieldErrors(prev => ({ ...prev, researchField: "" }));
  };

  const handleCompanySizeSelect = (size) => {
    setPersonal(p => ({ ...p, companySize: size }));
    setShowCompanySizeDropdown(false);
    setCompanySizeSearch("");
    setFieldErrors(prev => ({ ...prev, companySize: "" }));
  };

  const handleIndustrySelect = (industry) => {
    setPersonal(p => ({ ...p, industry }));
    setShowIndustryDropdown(false);
    setIndustrySearch("");
    setFieldErrors(prev => ({ ...prev, industry: "" }));
  };

  const handleCareerGoalsSelect = (goal) => {
    setPersonal(p => ({ ...p, careerGoals: goal }));
    setShowCareerGoalsDropdown(false);
    setCareerGoalsSearch("");
    setFieldErrors(prev => ({ ...prev, careerGoals: "" }));
  };

  const handleHobbiesSelect = (hobby) => {
    setPersonal(p => {
      const currentHobbies = p.hobbies || [];
      const isSelected = currentHobbies.includes(hobby);
      
      if (isSelected) {
        // Remove if already selected
        return { ...p, hobbies: currentHobbies.filter(h => h !== hobby) };
      } else {
        // Add if not selected
        return { ...p, hobbies: [...currentHobbies, hobby] };
      }
    });
    setFieldErrors(prev => ({ ...prev, hobbies: "" }));
  };

  const handleExpectationsSelect = (expectation) => {
    setPersonal(p => {
      const currentExpectations = p.expectations || [];
      const isSelected = currentExpectations.includes(expectation);
      
      if (isSelected) {
        // Remove if already selected
        return { ...p, expectations: currentExpectations.filter(e => e !== expectation) };
      } else {
        // Add if not selected
        return { ...p, expectations: [...currentExpectations, expectation] };
      }
    });
    setFieldErrors(prev => ({ ...prev, expectations: "" }));
  };

  // Theme toggle function
  const toggleTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newTheme = editorTheme === "custom-dark" ? "vs-light" : "custom-dark";
    setEditorTheme(newTheme);

    if (window.monaco) {
      window.monaco.editor.setTheme(newTheme);
    }
  };

  // Keyboard search handlers
  const handleKeyPress = (e, searchState, setSearchState, options, selectHandler) => {
    if (e.key.length === 1) {
      const newSearch = searchState + e.key.toLowerCase();
      setSearchState(newSearch);
      
      // Find the first option that starts with the search
      const foundOption = options.find(option => 
        option.toLowerCase().startsWith(newSearch)
      );
      
      if (foundOption) {
        // Highlight the found option (you can add visual highlighting later)
        console.log('Found:', foundOption);
      }
    }
  };

  // Filter options based on search
  const filterOptions = (options, search) => {
    if (!search) return options;
    return options.filter(option => 
      option.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Helper function to format multi-select display text
  const formatMultiSelectDisplay = (items, maxItems = 2) => {
    if (!items || items.length === 0) return "";
    
    // Always show all items, no truncation
    return items.join(", ");
  };

  // Helper to close all dropdowns
  const closeAllDropdowns = () => {
    setShowJobDropdown(false);
    setShowCountryDropdown(false);
    setShowExperienceDropdown(false);
    setShowYearDropdown(false);
    setShowSemesterDropdown(false);
    setShowEducationLevelDropdown(false);
    setShowFieldOfStudyDropdown(false);
    setShowSpecializationDropdown(false);
    setShowTeachingSubjectDropdown(false);
    setShowResearchFieldDropdown(false);
    setShowCompanySizeDropdown(false);
    setShowIndustryDropdown(false);
    setShowCareerGoalsDropdown(false);
    setShowHobbiesDropdown(false);
    setShowExpectationsDropdown(false);
  };

  // Render dynamic questions based on job
  const renderDynamicQuestions = () => {
    if (personal.job === "Student") {
      return (
        <>
          <div className="placement-form-group">
            <label>What is your education level?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowEducationLevelDropdown((prev) => !prev);
                }}
                onKeyDown={(e) => handleKeyPress(e, educationLevelSearch, setEducationLevelSearch, educationLevelOptions, handleEducationLevelSelect)}
              >
                {personal.educationLevel || "Select education level"}
                <span className="placement-arrow">▼</span>
              </button>
              {showEducationLevelDropdown && (
                <div className="placement-dropdown-options">
                  {filterOptions(educationLevelOptions, educationLevelSearch).map(level => (
                    <div 
                      key={level} 
                      className="placement-dropdown-option"
                      onClick={() => handleEducationLevelSelect(level)}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.educationLevel && <div className="placement-field-error">{fieldErrors.educationLevel}</div>}
          </div>
          
          {/* Field of study - only for University, Master's, and PhD */}
          {(personal.educationLevel === "University" || personal.educationLevel === "Master's" || personal.educationLevel === "PhD") && (
            <div className="placement-form-group">
              <label>What are you studying?</label>
              <div className="placement-custom-dropdown">
                <button 
                  type="button"
                  className="placement-custom-select"
                  onClick={() => {
                    closeAllDropdowns();
                    setShowFieldOfStudyDropdown((prev) => !prev);
                  }}
                  onKeyDown={(e) => handleKeyPress(e, fieldOfStudySearch, setFieldOfStudySearch, fieldOfStudyOptions, handleFieldOfStudySelect)}
                >
                  {personal.fieldOfStudy || "Select field of study"}
                  <span className="placement-arrow">▼</span>
                </button>
                {showFieldOfStudyDropdown && (
                  <div className="placement-dropdown-options">
                    {filterOptions(fieldOfStudyOptions, fieldOfStudySearch).map(field => (
                      <div 
                        key={field} 
                        className="placement-dropdown-option"
                        onClick={() => handleFieldOfStudySelect(field)}
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fieldErrors.fieldOfStudy && <div className="placement-field-error">{fieldErrors.fieldOfStudy}</div>}
            </div>
          )}
          
          {personal.educationLevel === "University" && (
            <div className="placement-form-group">
              <label>Which year are you in?</label>
              <div className="placement-custom-dropdown">
                <button 
                  type="button"
                  className="placement-custom-select"
                  onClick={() => {
                    closeAllDropdowns();
                    setShowYearDropdown((prev) => !prev);
                  }}
                >
                  {personal.studentYear || "Select year"}
                  <span className="placement-arrow">▼</span>
                </button>
                {showYearDropdown && (
                  <div className="placement-dropdown-options">
                    {[1, 2, 3, 4].map(yearOption => (
                      <div 
                        key={yearOption} 
                        className="placement-dropdown-option"
                        onClick={() => {
                          setPersonal(p => ({ ...p, studentYear: yearOption }));
                          setShowYearDropdown(false);
                        }}
                      >
                        {yearOption}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fieldErrors.studentYear && <div className="placement-field-error">{fieldErrors.studentYear}</div>}
            </div>
          )}
        </>
      );
    } else if (personal.job === "Software Engineer") {
      return (
        <>
          <div className="placement-form-group">
            <label>How many years of experience do you have?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowYearDropdown((prev) => !prev);
                }}
              >
                {personal.yearsOfExperience || "Select years of experience"}
                <span className="placement-arrow">▼</span>
              </button>
              {showYearDropdown && (
                <div className="placement-dropdown-options">
                  {["Less than 1 year", "1-2 years", "3-5 years", "5-10 years", "10+ years"].map(exp => (
                    <div 
                      key={exp} 
                      className="placement-dropdown-option"
                      onClick={() => {
                        setPersonal(p => ({ ...p, yearsOfExperience: exp }));
                        setShowYearDropdown(false);
                      }}
                    >
                      {exp}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.yearsOfExperience && <div className="placement-field-error">{fieldErrors.yearsOfExperience}</div>}
          </div>
          
          <div className="placement-form-group">
            <label>What is your specialization?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowSpecializationDropdown((prev) => !prev);
                }}
                onKeyDown={(e) => handleKeyPress(e, specializationSearch, setSpecializationSearch, specializationOptions, handleSpecializationSelect)}
              >
                {personal.specialization || "Select specialization"}
                <span className="placement-arrow">▼</span>
              </button>
              {showSpecializationDropdown && (
                <div className="placement-dropdown-options">
                  {filterOptions(specializationOptions, specializationSearch).map(spec => (
                    <div 
                      key={spec} 
                      className="placement-dropdown-option"
                      onClick={() => handleSpecializationSelect(spec)}
                    >
                      {spec}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.specialization && <div className="placement-field-error">{fieldErrors.specialization}</div>}
          </div>
          
          <div className="placement-form-group">
            <label>What industry do you work in?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowIndustryDropdown((prev) => !prev);
                }}
                onKeyDown={(e) => handleKeyPress(e, industrySearch, setIndustrySearch, industryOptions, handleIndustrySelect)}
              >
                {personal.industry || "Select industry"}
                <span className="placement-arrow">▼</span>
              </button>
              {showIndustryDropdown && (
                <div className="placement-dropdown-options">
                  {filterOptions(industryOptions, industrySearch).map(industry => (
                    <div 
                      key={industry} 
                      className="placement-dropdown-option"
                      onClick={() => handleIndustrySelect(industry)}
                    >
                      {industry}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.industry && <div className="placement-field-error">{fieldErrors.industry}</div>}
          </div>
          
          <div className="placement-form-group">
            <label>What is your company size?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowCompanySizeDropdown((prev) => !prev);
                }}
                onKeyDown={(e) => handleKeyPress(e, companySizeSearch, setCompanySizeSearch, companySizeOptions, handleCompanySizeSelect)}
              >
                {personal.companySize || "Select company size"}
                <span className="placement-arrow">▼</span>
              </button>
              {showCompanySizeDropdown && (
                <div className="placement-dropdown-options">
                  {filterOptions(companySizeOptions, companySizeSearch).map(size => (
                    <div 
                      key={size} 
                      className="placement-dropdown-option"
                      onClick={() => handleCompanySizeSelect(size)}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.companySize && <div className="placement-field-error">{fieldErrors.companySize}</div>}
          </div>
        </>
      );
    } else if (personal.job === "Teacher") {
      return (
        <>
          <div className="placement-form-group">
            <label>What subject do you teach?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowTeachingSubjectDropdown((prev) => !prev);
                }}
                onKeyDown={(e) => handleKeyPress(e, teachingSubjectSearch, setTeachingSubjectSearch, teachingSubjectOptions, handleTeachingSubjectSelect)}
              >
                {personal.teachingSubject || "Select teaching subject"}
                <span className="placement-arrow">▼</span>
              </button>
              {showTeachingSubjectDropdown && (
                <div className="placement-dropdown-options">
                  {filterOptions(teachingSubjectOptions, teachingSubjectSearch).map(subject => (
                    <div 
                      key={subject} 
                      className="placement-dropdown-option"
                      onClick={() => handleTeachingSubjectSelect(subject)}
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.teachingSubject && <div className="placement-field-error">{fieldErrors.teachingSubject}</div>}
          </div>
        </>
      );
    } else if (personal.job === "Researcher") {
      return (
        <>
          <div className="placement-form-group">
            <label>What is your research field?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => {
                  closeAllDropdowns();
                  setShowResearchFieldDropdown((prev) => !prev);
                }}
                onKeyDown={(e) => handleKeyPress(e, researchFieldSearch, setResearchFieldSearch, researchFieldOptions, handleResearchFieldSelect)}
              >
                {personal.researchField || "Select research field"}
                <span className="placement-arrow">▼</span>
              </button>
              {showResearchFieldDropdown && (
                <div className="placement-dropdown-options">
                  {filterOptions(researchFieldOptions, researchFieldSearch).map(field => (
                    <div 
                      key={field} 
                      className="placement-dropdown-option"
                      onClick={() => handleResearchFieldSelect(field)}
                    >
                      {field}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {fieldErrors.researchField && <div className="placement-field-error">{fieldErrors.researchField}</div>}
          </div>
        </>
      );
    }
    return null;
  };

  // Renderers
  const renderProgress = () => (
    <div className="placement-progress-bar">
      <div className="placement-progress" style={{ width: `${progress}%` }} />
    </div>
  );

  const renderPlacementChoice = () => (
    <div className={`placement-test-page fade-${fade ? "in" : "out"}`}>
      <div className="placement-test-container">
        {renderProgress()}
        <h2>Choose Your Learning Path</h2>
        <div className="placement-choice-description">
          <p>How would you like to begin your learning journey?</p>
        </div>
        <div className="placement-choice-options">
          <div className="placement-choice-option">
            <h3>Start from Scratch</h3>
            <p>Begin your learning journey from the very beginning. Perfect for complete beginners or those who want a fresh start.</p>
            <button 
              className="placement-choice-btn"
              onClick={() => handlePlacementChoice('start_from_scratch')}
            >
              Let's Start Your Journey
            </button>
          </div>
          <div className="placement-choice-option">
            <h3>Take Placement Test</h3>
            <p>Take a quick assessment to determine your current skill level and get personalized recommendations.</p>
            <button 
              className="placement-choice-btn"
              onClick={() => handlePlacementChoice('placement')}
            >
              Take Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalSurvey = () => (
    <div className={`placement-test-page fade-${fade ? "in" : "out"}`}> 
      <div className="placement-test-container">
        {renderProgress()}
        <h2>Personal & Academic Information</h2>
        <div className="placement-description">
          <p>This comprehensive survey helps us understand your background and create a personalized learning experience. 
          We'll use this information to recommend the best starting point and learning path for your journey.</p>
        </div>
        
        <div className="placement-form-group">
          <label>What is your current job/role?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowJobDropdown((prev) => !prev);
              }}
              onKeyDown={(e) => handleKeyPress(e, jobSearch, setJobSearch, jobOptions, handleJobSelect)}
            >
              {personal.job || "Select your job"}
              <span className="placement-arrow">▼</span>
            </button>
            {showJobDropdown && (
              <div className="placement-dropdown-options">
                {filterOptions(jobOptions, jobSearch).map(job => (
                  <div 
                    key={job} 
                    className="placement-dropdown-option"
                    onClick={() => handleJobSelect(job)}
                  >
                    {job}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="placement-helper">Choose the closest match to your current role.</div>
          {fieldErrors.job && <div className="placement-field-error">{fieldErrors.job}</div>}
        </div>
        
        {/* Dynamic questions based on job selection */}
        {renderDynamicQuestions()}
        
        {/* University field - only for non-students */}
        {personal.job && personal.job !== "Student" && (
          <div className="placement-form-group">
            <label>Which university are you affiliated with?</label>
            <input 
              className="placement-input" 
              value={personal.university} 
              onChange={e => {
                setPersonal(p => ({ ...p, university: e.target.value }));
                if (e.target.value.trim()) {
                  setFieldErrors(prev => ({ ...prev, university: "" }));
                }
              }} 
              placeholder="Enter your university name" 
            />
            <div className="placement-helper">Type your university name.</div>
            {fieldErrors.university && <div className="placement-field-error">{fieldErrors.university}</div>}
          </div>
        )}
        
        <div className="placement-form-group">
          <label>Which country are you from?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowCountryDropdown((prev) => !prev);
              }}
              onKeyDown={(e) => handleKeyPress(e, countrySearch, setCountrySearch, countryOptions, handleCountrySelect)}
            >
              {personal.country || "Select your country"}
              <span className="placement-arrow">▼</span>
            </button>
            {showCountryDropdown && (
              <div className="placement-dropdown-options">
                {filterOptions(countryOptions, countrySearch).map(country => (
                  <div 
                    key={country} 
                    className="placement-dropdown-option"
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
          {fieldErrors.country && <div className="placement-field-error">{fieldErrors.country}</div>}
        </div>
        <div className="placement-form-group">
          <label>What is your experience level in this field?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowExperienceDropdown((prev) => !prev);
              }}
              onKeyDown={(e) => handleKeyPress(e, experienceSearch, setExperienceSearch, experienceOptions, handleExperienceSelect)}
            >
              {personal.experience || "Select experience level"}
              <span className="placement-arrow">▼</span>
            </button>
            {showExperienceDropdown && (
              <div className="placement-dropdown-options">
                {filterOptions(experienceOptions, experienceSearch).map(experience => (
                  <div 
                    key={experience} 
                    className="placement-dropdown-option"
                    onClick={() => handleExperienceSelect(experience)}
                  >
                    {experience}
                  </div>
                ))}
              </div>
            )}
          </div>
          {fieldErrors.experience && <div className="placement-field-error">{fieldErrors.experience}</div>}
        </div>
        
        {/* Simple gold line */}
        <div className="placement-simple-line"></div>
        
        {/* Academic Information */}
        <div className="placement-section-divider">
          <span>Academic Information</span>
        </div>
        
        <div className="placement-form-group">
          <label>Semester</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowSemesterDropdown((prev) => !prev);
              }}
            >
              {semester}
              <span className="placement-arrow">▼</span>
            </button>
            {showSemesterDropdown && (
              <div className="placement-dropdown-options">
                {[1, 2].map(semesterOption => (
                  <div 
                    key={semesterOption} 
                    className="placement-dropdown-option"
                    onClick={() => handleSemesterSelect(semesterOption)}
                  >
                    {semesterOption}
                  </div>
                ))}
              </div>
            )}
          </div>
          {fieldErrors.semester && <div className="placement-field-error">{fieldErrors.semester}</div>}
        </div>
        
        <div className="placement-form-group">
          <label>What are your career goals?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowCareerGoalsDropdown((prev) => !prev);
              }}
              onKeyDown={(e) => handleKeyPress(e, careerGoalsSearch, setCareerGoalsSearch, careerGoalsOptions, handleCareerGoalsSelect)}
            >
              {personal.careerGoals || "Select career goals"}
              <span className="placement-arrow">▼</span>
            </button>
            {showCareerGoalsDropdown && (
              <div className="placement-dropdown-options">
                {filterOptions(careerGoalsOptions, careerGoalsSearch).map(goal => (
                  <div 
                    key={goal} 
                    className="placement-dropdown-option"
                    onClick={() => handleCareerGoalsSelect(goal)}
                  >
                    {goal}
                  </div>
                ))}
              </div>
            )}
          </div>
          {fieldErrors.careerGoals && <div className="placement-field-error">{fieldErrors.careerGoals}</div>}
        </div>
        <div className="placement-form-group">
          <label>What are your hobbies and interests?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowHobbiesDropdown((prev) => !prev);
              }}
              onKeyDown={(e) => handleKeyPress(e, hobbiesSearch, setHobbiesSearch, hobbiesOptions, handleHobbiesSelect)}
              title={personal.hobbies && personal.hobbies.length > 0 ? personal.hobbies.join(", ") : "Select hobbies"}
            >
              {personal.hobbies && personal.hobbies.length > 0 
                ? formatMultiSelectDisplay(personal.hobbies, 2)
                : "Select hobbies"}
              <span className="placement-arrow">▼</span>
            </button>
            {showHobbiesDropdown && (
              <div className="placement-dropdown-options">
                {filterOptions(hobbiesOptions, hobbiesSearch).map(hobby => {
                  const isSelected = personal.hobbies && personal.hobbies.includes(hobby);
                  return (
                    <div 
                      key={hobby} 
                      className={`placement-dropdown-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleHobbiesSelect(hobby)}
                    >
                      <span className="option-text">{hobby}</span>
                      {isSelected && <span className="checkmark">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {fieldErrors.hobbies && <div className="placement-field-error">{fieldErrors.hobbies}</div>}
        </div>
        <div className="placement-form-group">
          <label>What are your expectations for this course?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => {
                closeAllDropdowns();
                setShowExpectationsDropdown((prev) => !prev);
              }}
              onKeyDown={(e) => handleKeyPress(e, expectationsSearch, setExpectationsSearch, expectationsOptions, handleExpectationsSelect)}
              title={personal.expectations && personal.expectations.length > 0 ? personal.expectations.join(", ") : "Select expectations"}
            >
              {personal.expectations && personal.expectations.length > 0 
                ? formatMultiSelectDisplay(personal.expectations, 2)
                : "Select expectations"}
              <span className="placement-arrow">▼</span>
            </button>
            {showExpectationsDropdown && (
              <div className="placement-dropdown-options">
                {filterOptions(expectationsOptions, expectationsSearch).map(expectation => {
                  const isSelected = personal.expectations && personal.expectations.includes(expectation);
                  return (
                    <div 
                      key={expectation} 
                      className={`placement-dropdown-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleExpectationsSelect(expectation)}
                    >
                      <span className="option-text">{expectation}</span>
                      {isSelected && <span className="checkmark">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {fieldErrors.expectations && <div className="placement-field-error">{fieldErrors.expectations}</div>}
        </div>
        {personalError && <div className="placement-error">{personalError}</div>}
        <button className="placement-submit-btn placement-animated-btn" onClick={handlePersonalNext}>Continue</button>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className={`placement-test-page fade-${fade ? "in" : "out"}`}>
      <div className="placement-test-container">
        {renderProgress()}
        <h2>Placement Test</h2>
        <div className="placement-back-btn">
          <button className="placement-back-button" onClick={prevStep}>
            ← Back to Information
          </button>
        </div>
        {testError && <div className="placement-error">{testError}</div>}
        {loading ? (
          <div className="placement-loading">
            <div>Loading test questions...</div>
          </div>
        ) : questions.length === 0 ? (
          <div className="placement-no-questions">
            <div className="placement-error">
              No questions found for this course. Please try again or contact support.
            </div>
            <button className="placement-submit-btn placement-animated-btn" onClick={prevStep}>
              Go Back
            </button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); handleSubmitTest(); }}>
            {questions.map((q, idx) => (
              <div key={q.id} className={`placement-question placement-${q.difficulty || ''}`} style={{ marginBottom: 32 }}>
                <div className="placement-q-title" style={{ fontSize: 18, marginBottom: 8 }}>
                  {idx + 1}. {q.text}
                </div>
                {q.type === "mcq" && (
                  <div className="placement-options">
                    {q.options.map(opt => (
                      <label key={opt} className="placement-option">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                        /> {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "truefalse" && (
                  <div className="placement-options">
                    <label className="placement-option">
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="True"
                        checked={answers[q.id] === "True"}
                        onChange={() => setAnswers(a => ({ ...a, [q.id]: "True" }))}
                      /> True
                    </label>
                    <label className="placement-option">
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="False"
                        checked={answers[q.id] === "False"}
                        onChange={() => setAnswers(a => ({ ...a, [q.id]: "False" }))}
                      /> False
                    </label>
                  </div>
                )}
                {q.type === "coding" && (
                  <>
                    <div className="placement-theme-toggle-container">
                      <button 
                        type="button"
                        className="placement-theme-toggle-button" 
                        onClick={toggleTheme}
                      >
                        {editorTheme === "custom-dark" ? "☀️ Light Theme" : "🌙 Dark Theme"}
                      </button>
                    </div>
                    <div className="placement-code-editor">
                      <MonacoEditor
                        width="100%"
                        height="450px"
                        language="cpp"
                        theme={editorTheme}
                        value={answers[q.id] || ""}
                        onChange={(value) => setAnswers(a => ({ ...a, [q.id]: value || "" }))}
                        onMount={(editor, monaco) => {
                          console.log('Monaco Editor mounted successfully');
                          // Define custom theme to match C++ course
                          monaco.editor.defineTheme("custom-dark", {
                            base: "vs-dark",
                            inherit: true,
                            rules: [
                              { token: "keyword", foreground: "c678dd" },
                              { token: "number", foreground: "d19a66" },
                              { token: "string", foreground: "98c379" },
                              { token: "comment", foreground: "5c6370", fontStyle: "italic" },
                              { token: "identifier", foreground: "e06c75" },
                              { token: "operator", foreground: "abb2bf" },
                              { token: "function", foreground: "61afef" },
                              { token: "type", foreground: "e5c07b" },
                            ],
                            colors: {
                              "editor.background": "#1e1e1e",
                              "editor.foreground": "#abb2bf",
                              "editor.lineHighlightBackground": "#2a2a2a",
                              "editorCursor.foreground": "#528bff",
                            },
                          });
                          monaco.editor.setTheme(editorTheme);
                        }}
                        options={{
                          fontSize: 15,
                          lineHeight: 24,
                          fontFamily: "Fira Code, monospace",
                          fontWeight: "500",
                          mouseWheelZoom: true,
                          scrollBeyondLastLine: false,
                          roundedSelection: true,
                          padding: { top: 20 },
                          contextmenu: true,
                          lineNumbers: "on",
                          folding: true,
                          renderLineHighlight: "all",
                          wordWrap: "on",
                          formatOnPaste: true,
                          minimap: { enabled: false },
                          automaticLayout: true,
                          bracketPairColorization: { enabled: true, independentColorPool: true },
                          semanticHighlighting: { enabled: true },
                          scrollbar: { vertical: "auto", horizontal: "auto", handleMouseWheel: true },
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: "on",
                          cursorStyle: "line",
                          cursorWidth: 2,
                          fontLigatures: true,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
            <button className="placement-submit-btn placement-animated-btn" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Test"}</button>
          </form>
        )}
      </div>
    </div>
  );

  const renderResult = () => (
    <div className={`placement-test-page fade-${fade ? "in" : "out"}`}>
      <div className="placement-test-container">
        {renderProgress()}
        <h2>Welcome to Your Learning Journey!</h2>
        {result ? (
          <div>
            <div className="placement-result-message">
              {result.passed 
                ? "Congratulations! You're all set to start learning." 
                : "Don't worry! We'll help you build a strong foundation."}
            </div>
            <button 
              className="placement-submit-btn placement-animated-btn" 
              onClick={() => {
                if (courseId) {
                  // Redirect to the specific course
                  navigate(`/course/${courseId}`);
                } else {
                  // Fallback to homepage if no courseId
                  navigate("/home");
                }
              }}
            >
              {courseId ? "Start Learning" : "Go to Homepage"}
            </button>
          </div>
        ) : (
          <div>Loading result...</div>
        )}
      </div>
    </div>
  );

  // Check if user has completed general form on component mount
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const response = await apiClient.get("/user");
        if (response.data && response.data.has_completed_general_form) {
          setHasCompletedGeneralForm(true);
          setShowPlacementChoice(true); // Go to placement choice
        } else {
          setHasCompletedGeneralForm(false);
          setStep(1); // Start from personal survey
        }
      } catch (err) {
        console.error('Error checking user profile:', err);
      }
    };
    
    checkUserProfile();
  }, [courseId, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.placement-custom-dropdown')) {
        setShowJobDropdown(false);
        setShowCountryDropdown(false);
        setShowExperienceDropdown(false);
        setShowEducationLevelDropdown(false);
        setShowFieldOfStudyDropdown(false);
        setShowSpecializationDropdown(false);
        setShowTeachingSubjectDropdown(false);
        setShowResearchFieldDropdown(false);
        setShowCompanySizeDropdown(false);
        setShowIndustryDropdown(false);
        setShowCareerGoalsDropdown(false);
        setShowHobbiesDropdown(false);
        setShowExpectationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      {loading ? (
        <div className="placement-test-page">
          <div className="placement-test-container">
            <div className="placement-loading">
              <div>Loading...</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {step === 1 && !showPlacementChoice && renderPersonalSurvey()}
          {step === 1 && showPlacementChoice && renderPlacementChoice()}
          {step === 2 && renderTest()}
          {step === 3 && renderResult()}
        </>
      )}
    </div>
  );
};

export default PlacementTest;