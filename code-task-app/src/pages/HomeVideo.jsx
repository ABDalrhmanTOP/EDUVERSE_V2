import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "../api/axios"; // Your axios instance
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import { FaPlay, FaSync, FaGraduationCap, FaCode, FaBook, FaStar, FaChevronDown } from "react-icons/fa";
import PlacementTest from "./PlacementTest";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/HomeVideo.css"; // Link to updated CSS file

// --- Helper: Simple Hash (Keep as is) ---
const simpleHash = (str) => {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// --- CourseCard Component (Modern Design) ---
const CourseCard = ({ course, handleCourseClick, index }) => {
  const isComingSoon = course.comingSoon;
  const isAvailable = !isComingSoon;
  const isCpp = course.name && course.name.toLowerCase().includes("c++");

  // Get thumbnail URL
  const getThumbnailUrl = (videoId) => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };
  const thumbnailUrl = getThumbnailUrl(course.videoId);

  return (
    <motion.div
      className={`course-card ${isAvailable ? 'available' : 'locked'}${isCpp ? ' cpp-accent' : ''}`}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay: index * 0.13, ease: 'easeOut' }}
      tabIndex={0}
      aria-label={course.name || 'Course'}
      onClick={() => {
        if (isAvailable) handleCourseClick(course);
      }}
      onKeyDown={e => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) handleCourseClick(course);
      }}
      style={{ outline: 'none' }}
    >
      {/* Course Thumbnail */}
      <div className="course-thumbnail-container">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={course.name || 'Course thumbnail'} 
            className="course-thumbnail"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
            }}
          />
        ) : (
          <div className="course-thumbnail-placeholder">
            <FaBook style={{ fontSize: '3rem', color: '#8b7355', opacity: 0.5 }} />
          </div>
        )}
        {/* Description Overlay (shows on hover/focus) */}
        <div className="course-description-overlay">
          {course.description || 'No description available.'}
        </div>
        {/* Play Overlay (above description) */}
        {isAvailable && (
          <div className="course-play-overlay">
            <FaPlay className="play-icon" />
          </div>
        )}
      </div>

      {/* Course Content (no description here) */}
      <div className="course-content">
        <h3 className="course-title">{course.name || 'Unnamed Course'}</h3>
        {isAvailable && (
          <>
            {/* Course Meta */}
            <div className="course-meta">
              <div className="course-rating">
                <FaStar className="rating-star" />
                <span>{course.average_rating ? course.average_rating.toFixed(1) : "N/A"}</span>
              </div>
              <div className="course-level">
                {course.year && course.semester ? `Year ${course.year}` : 'Beginner'}
              </div>
              {/* Show paid badge if course is paid */}
              {course.paid && (
                <div className="course-paid-badge">
                  <span className="paid-icon">💰</span>
                  <span>Paid Course</span>
                </div>
              )}
            </div>
            {/* Action Button */}
            <button
              className="course-action-btn"
              tabIndex={0}
              aria-label={`Start ${course.name}`}
              onClick={e => {
                e.stopPropagation();
                handleCourseClick(course);
              }}
            >
              {course.paid ? 'Unlock Course' : 'Start Course'}
              <FaPlay className="btn-icon" />
            </button>
          </>
        )}
        {isComingSoon && (
          <p className="course-status-locked">This course is not yet available.</p>
        )}
      </div>
    </motion.div>
  );
};

// --- HomeVideo Component (Main Logic) ---
const HomeVideo = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [placementPassed, setPlacementPassed] = useState(false);

  // Only keep C++ as static fallback
  const staticCppCourse = {
    id: "cpp-static",
    name: "C++ Programming Fundamentals",
    description: "Master the fundamentals of C++ programming with comprehensive tutorials and hands-on exercises.",
    videoId: "vLnPwxZdW4Y",
    year: 1,
    semester: 1,
    comingSoon: false,
    average_rating: 4.8
  };

  // Group courses by year and semester with simple labels
  const organizeCoursesByCategory = (courses) => {
    const categories = {};
    
    courses.forEach(course => {
      const year = course.year || 1;
      const semester = course.semester || 1;
      
      // Simple year/semester grouping
      const categoryName = `Year ${year} - Semester ${semester}`;
      const categoryIcon = FaGraduationCap;
      const categorySubtitle = `Academic Year ${year}, Semester ${semester} Courses`;
      
      if (!categories[categoryName]) {
        categories[categoryName] = {
          icon: categoryIcon,
          subtitle: categorySubtitle,
          courses: []
        };
      }
      categories[categoryName].courses.push(course);
    });
    
    return categories;
  };

  useEffect(() => {
    const fetchAndSetCourses = async () => {
      setLoading(true);
      setError("");
      let apiCourses = [];
      try {
        const response = await axios.get("/courses");
        if (response.data && response.data.length > 0) {
          apiCourses = response.data.map((course) => ({
            id: course.id,
            name: course.name,
            description: course.description,
            videoId: course.video_id,
            comingSoon: false,
            average_rating: course.average_rating || 4.0,
            isFetched: true,
            year: course.year,
            semester: course.semester,
            paid: course.paid,
          }));
        }
      } catch (err) {
        setError("Failed to load some courses, showing available ones.");
      } finally {
        // Ensure C++ is always present
        const hasCpp = apiCourses.some((c) => c.name && c.name.toLowerCase().includes("c++"));
        const finalCourses = hasCpp ? apiCourses : [staticCppCourse, ...apiCourses];
        setCourses(finalCourses);
        setLoading(false);
      }
    };
    fetchAndSetCourses();
  }, []);

  // Filter courses based on courseFilter
  const filteredCourses = courses.filter(course => {
    if (courseFilter === 'all') return true;
    if (courseFilter === 'paid') return course.paid === true || course.paid === 1;
    if (courseFilter === 'free') return course.paid === false || course.paid === 0 || course.paid === null || course.paid === undefined;
    return true;
  });

  // Group filtered courses for display
  const courseCategories = organizeCoursesByCategory(filteredCourses);

  const refreshCourses = async () => {
    setLoading(true);
    setError("");
    let apiCourses = [];
    try {
      const response = await axios.get("/courses");
      if (response.data && response.data.length > 0) {
        apiCourses = response.data.map((course) => ({
          id: course.id,
          name: course.name,
          description: course.description,
          videoId: course.video_id,
          comingSoon: false,
          average_rating: course.average_rating || 4.0,
          isFetched: true,
          year: course.year,
          semester: course.semester,
          paid: course.paid,
        }));
      }
    } catch (err) {
      setError("Failed to refresh courses.");
    } finally {
      const hasCpp = apiCourses.some((c) => c.name && c.name.toLowerCase().includes("c++"));
      const finalCourses = hasCpp ? apiCourses : [staticCppCourse, ...apiCourses];
      setCourses(finalCourses);
      setLoading(false);
    }
  };

  // Check if user has passed placement for the course's year/semester
  const checkPlacement = async (course) => {
    try {
      // You may want to adjust the endpoint/logic based on your backend
      const res = await axios.get("/user-progress/course-progress/" + user.id);
      // Example: if user has unlocked this course, placement is passed
      if (res.data && res.data.unlocked_courses && res.data.unlocked_courses.includes(course.id)) {
        setPlacementPassed(true);
        return true;
      }
    } catch (err) {}
    setPlacementPassed(false);
    return false;
  };

  const handleCourseClick = async (course) => {
    if (!course.comingSoon) {
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        if (course.id) {
          try {
            // Check if user has already completed placement test for this course
            const response = await axios.post('/placement-test/check-completion', {
              course_id: course.id
            });
            
            if (response.data.completed) {
              // User has already completed placement test, go directly to course
              navigate(`/course/${course.id}`);
            } else {
              // User hasn't completed placement test, go to placement test
              navigate(`/placement-test/${course.id}`);
            }
          } catch (error) {
            console.error('Error checking placement test completion:', error);
            // Fallback: go to placement test
            navigate(`/placement-test/${course.id}`);
          }
        } else {
          setError("Could not navigate to the course (missing ID).");
        }
      }
    }
  };

  return (
    <div className="home-video-container">
      {showPlacementTest && (
        <PlacementTest onComplete={() => {
          setShowPlacementTest(false);
          if (selectedCourse) navigate(`/course/${selectedCourse.id}`);
        }} />
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="section-title">Explore Our Courses</h2>
        <button
          className="refresh-btn-modern"
          onClick={refreshCourses}
          disabled={loading}
        >
          <FaSync style={{ fontSize: '1.1em' }} />
          {loading ? "Refreshing..." : "Refresh Courses"}
        </button>
      </div>
      {/* Filter Dropdown */}
      <div className="courses-page-filter-wrapper">
        <button
          className="courses-page-filter-btn"
          onClick={() => setShowFilterDropdown((prev) => !prev)}
        >
          {courseFilter === 'all' ? 'All Courses' : courseFilter === 'paid' ? 'Paid Courses' : 'Free Courses'} <FaChevronDown style={{ fontSize: '0.9em', marginLeft: 6 }} />
        </button>
        {showFilterDropdown && (
          <div className="courses-page-filter-dropdown">
            <button className={`dropdown-item${courseFilter === 'all' ? ' selected' : ''}`} onClick={() => { setCourseFilter('all'); setShowFilterDropdown(false); }}>All Courses</button>
            <button className={`dropdown-item${courseFilter === 'paid' ? ' selected' : ''}`} onClick={() => { setCourseFilter('paid'); setShowFilterDropdown(false); }}>Paid Courses</button>
            <button className={`dropdown-item${courseFilter === 'free' ? ' selected' : ''}`} onClick={() => { setCourseFilter('free'); setShowFilterDropdown(false); }}>Free Courses</button>
          </div>
        )}
      </div>
      {/* End Filter Dropdown */}
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : Object.keys(courseCategories).length > 0 ? (
        <div className="courses-categories">
          {Object.entries(courseCategories).map(([categoryName, categoryData], categoryIndex) => (
            <motion.div
              key={categoryName}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="course-category-section"
            >
              <div className="category-header">
                <div className="category-title">
                  <div className="category-icon">
                    {categoryData.icon && React.createElement(categoryData.icon, { size: 28, color: '#a68a6d' })}
                  </div>
                  <span>{categoryName}</span>
                </div>
                <div className="category-subtitle">
                  {categoryData.subtitle}
                </div>
              </div>
              
              <div className="courses-grid">
                {categoryData.courses.map((course, courseIndex) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    handleCourseClick={handleCourseClick}
                    index={courseIndex}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="no-courses-message">No courses are currently available.</p>
      )}
    </div>
  );
};

export default HomeVideo;