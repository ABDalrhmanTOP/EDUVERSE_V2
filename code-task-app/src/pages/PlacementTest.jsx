import React, { useState } from "react";
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
  hobbies: "",
  expectations: "",
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

const PlacementTest = ({ onComplete }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState(personalInitial);
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
    const errors = [];

    // Basic required fields
    if (!personal.job) errors.push("Please select your job/role");
    if (!personal.university) errors.push("Please enter your university name");
    if (!personal.country) errors.push("Please select your country");
    if (!personal.experience) errors.push("Please select your experience level");
    if (!personal.careerGoals?.trim()) errors.push("Please describe your career goals");
    if (!personal.hobbies?.trim()) errors.push("Please share your hobbies and interests");
    if (!personal.expectations?.trim()) errors.push("Please share your expectations for this course");

    // Dynamic validation based on job
    if (personal.job === "Student") {
      if (!personal.educationLevel) errors.push("Please select your education level");
      if (!personal.fieldOfStudy) errors.push("Please select your field of study");
      if (personal.educationLevel === "University" && !personal.studentYear) {
        errors.push("Please select your university year");
      }
    } else if (personal.job === "Software Engineer") {
      if (!personal.yearsOfExperience) errors.push("Please select your years of experience");
      if (!personal.specialization) errors.push("Please select your specialization");
      if (!personal.industry) errors.push("Please select your industry");
      if (!personal.companySize) errors.push("Please select your company size");
    } else if (personal.job === "Teacher") {
      if (!personal.teachingSubject) errors.push("Please select your teaching subject");
    } else if (personal.job === "Researcher") {
      if (!personal.researchField) errors.push("Please select your research field");
    }

    // Academic fields validation
    if (!semester) errors.push("Please select semester");

    return errors;
  };

  // Personal survey validation
  const handlePersonalNext = () => {
    const errors = validateFields();
    
    if (errors.length > 0) {
      setPersonalError(errors.join(". "));
      return;
    }
    
    setPersonalError("");
    
    // Check if user should skip placement test
    if (personal.experience === "Newbie (No experience)") {
      setSkipPlacementTest(true);
      setShowPlacementChoice(true);
    } else {
      nextStep();
    }
  };

  // Handle placement test choice
  const handlePlacementChoice = (choice) => {
    if (choice === "skip") {
      // Skip to results or course access
      setResult({ passed: true, message: "Welcome! You'll start from the beginning." });
      setStep(3);
    } else {
      // Take placement test
      setShowPlacementChoice(false);
      nextStep();
    }
  };

  // Academic survey
  const handleAcademicNext = async () => {
    const errors = validateFields();
    
    if (errors.length > 0) {
      setAcademicError(errors.join(". "));
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
      const res = await apiClient.post(`/placement-test/submit`, {
        course_id: courseId,
        year,
        semester,
        answers,
      });
      setResult(res.data.result);
      nextStep();
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
  };

  const handleCountrySelect = (country) => {
    setPersonal(p => ({ ...p, country }));
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const handleExperienceSelect = (experience) => {
    setPersonal(p => ({ ...p, experience }));
    setShowExperienceDropdown(false);
    setExperienceSearch("");
  };

  const handleYearSelect = (selectedYear) => {
    setYear(selectedYear);
    setShowYearDropdown(false);
  };

  const handleSemesterSelect = (selectedSemester) => {
    setSemester(selectedSemester);
    setShowSemesterDropdown(false);
  };

  // Dynamic dropdown handlers
  const handleEducationLevelSelect = (level) => {
    setPersonal(p => ({ ...p, educationLevel: level }));
    setShowEducationLevelDropdown(false);
    setEducationLevelSearch("");
    if (level !== "University") {
      setPersonal(p => ({ ...p, studentYear: "" }));
    }
  };

  const handleFieldOfStudySelect = (field) => {
    setPersonal(p => ({ ...p, fieldOfStudy: field }));
    setShowFieldOfStudyDropdown(false);
    setFieldOfStudySearch("");
  };

  const handleSpecializationSelect = (specialization) => {
    setPersonal(p => ({ ...p, specialization }));
    setShowSpecializationDropdown(false);
    setSpecializationSearch("");
  };

  const handleTeachingSubjectSelect = (subject) => {
    setPersonal(p => ({ ...p, teachingSubject: subject }));
    setShowTeachingSubjectDropdown(false);
    setTeachingSubjectSearch("");
  };

  const handleResearchFieldSelect = (field) => {
    setPersonal(p => ({ ...p, researchField: field }));
    setShowResearchFieldDropdown(false);
    setResearchFieldSearch("");
  };

  const handleCompanySizeSelect = (size) => {
    setPersonal(p => ({ ...p, companySize: size }));
    setShowCompanySizeDropdown(false);
    setCompanySizeSearch("");
  };

  const handleIndustrySelect = (industry) => {
    setPersonal(p => ({ ...p, industry }));
    setShowIndustryDropdown(false);
    setIndustrySearch("");
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
                onClick={() => setShowEducationLevelDropdown(!showEducationLevelDropdown)}
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
          </div>
          
          <div className="placement-form-group">
            <label>What are you studying?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => setShowFieldOfStudyDropdown(!showFieldOfStudyDropdown)}
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
          </div>
          
          {personal.educationLevel === "University" && (
            <div className="placement-form-group">
              <label>Which year are you in?</label>
              <div className="placement-custom-dropdown">
                <button 
                  type="button"
                  className="placement-custom-select"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
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
                onClick={() => setShowYearDropdown(!showYearDropdown)}
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
          </div>
          
          <div className="placement-form-group">
            <label>What is your specialization?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => setShowSpecializationDropdown(!showSpecializationDropdown)}
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
          </div>
          
          <div className="placement-form-group">
            <label>What industry do you work in?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
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
          </div>
          
          <div className="placement-form-group">
            <label>What is your company size?</label>
            <div className="placement-custom-dropdown">
              <button 
                type="button"
                className="placement-custom-select"
                onClick={() => setShowCompanySizeDropdown(!showCompanySizeDropdown)}
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
                onClick={() => setShowTeachingSubjectDropdown(!showTeachingSubjectDropdown)}
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
                onClick={() => setShowResearchFieldDropdown(!showResearchFieldDropdown)}
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
        <h2>Learning Path Choice</h2>
        <div className="placement-choice-description">
          <p>Since you're new to this field, we have two options for you:</p>
          <div className="placement-choice-options">
            <div className="placement-choice-option">
              <h3>Start from Scratch</h3>
              <p>Begin with the fundamentals and build your knowledge step by step. Perfect for complete beginners.</p>
              <button 
                className="placement-choice-btn"
                onClick={() => handlePlacementChoice("skip")}
              >
                Start from Beginning
              </button>
            </div>
            <div className="placement-choice-option">
              <h3>Take Placement Test</h3>
              <p>Test your current knowledge to see if you can skip some basic concepts and start from where you're comfortable.</p>
              <button 
                className="placement-choice-btn"
                onClick={() => handlePlacementChoice("test")}
              >
                Take Test
              </button>
            </div>
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
              onClick={() => setShowJobDropdown(!showJobDropdown)}
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
        </div>
        
        {/* Dynamic questions based on job selection */}
        {renderDynamicQuestions()}
        
        <div className="placement-form-group">
          <label>Which university are you affiliated with?</label>
          <input className="placement-input" value={personal.university} onChange={e => setPersonal(p => ({ ...p, university: e.target.value }))} placeholder="Enter your university name" />
          <div className="placement-helper">Type your university name.</div>
        </div>
        <div className="placement-form-group">
          <label>Which country are you from?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
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
        </div>
        <div className="placement-form-group">
          <label>What is your experience level in this field?</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
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
        </div>
        
        {/* Academic Information */}
        <div className="placement-section-divider">
          <h3>Academic Information</h3>
        </div>
        
        <div className="placement-form-group">
          <label>Semester</label>
          <div className="placement-custom-dropdown">
            <button 
              type="button"
              className="placement-custom-select"
              onClick={() => setShowSemesterDropdown(!showSemesterDropdown)}
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
        </div>
        
        <div className="placement-form-group">
          <label>What are your career goals?</label>
          <input className="placement-input" value={personal.careerGoals} onChange={e => setPersonal(p => ({ ...p, careerGoals: e.target.value }))} placeholder="e.g. Become a software engineer, researcher, etc." />
        </div>
        <div className="placement-form-group">
          <label>What are your hobbies and interests?</label>
          <input className="placement-input" value={personal.hobbies} onChange={e => setPersonal(p => ({ ...p, hobbies: e.target.value }))} placeholder="e.g. Reading, Football, Coding" />
        </div>
        <div className="placement-form-group">
          <label>What are your expectations for this course?</label>
          <input className="placement-input" value={personal.expectations} onChange={e => setPersonal(p => ({ ...p, expectations: e.target.value }))} placeholder="What do you hope to achieve?" />
        </div>
        {personalError && <div className="placement-error">{personalError}</div>}
        <button className="placement-submit-btn placement-animated-btn" onClick={handleAcademicNext}>Continue</button>
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
            <div className="placement-result-message">{result.passed ? "Congratulations! You're all set to start learning." : "Don't worry! We'll help you build a strong foundation."}</div>
            <button className="placement-submit-btn placement-animated-btn" onClick={() => navigate("/home")}>Start Learning</button>
          </div>
        ) : (
          <div>Loading result...</div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {step === 1 && renderPersonalSurvey()}
      {step === 1 && showPlacementChoice && renderPlacementChoice()}
      {step === 2 && renderTest()}
      {step === 3 && renderResult()}
    </div>
  );
};

export default PlacementTest; 