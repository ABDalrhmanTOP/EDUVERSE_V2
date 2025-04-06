import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "../api/axios"; // Your axios instance
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Your Auth context
import { motion } from "framer-motion";

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

// --- PlaylistCard Component ---
const PlaylistCard = ({ playlist, handleCourseClick, index }) => {
  const isComingSoon = playlist.comingSoon;
  const isAvailable = !isComingSoon;

  // --- THUMBNAIL HANDLING ---
  const getMaxResThumbnailUrl = (videoId) => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const thumbnailUrl = getMaxResThumbnailUrl(playlist.videoId);
  const popupThumbnailUrl = thumbnailUrl; // Use same high-res for popup for consistency

  return (
    <motion.div
      className={`playlist-card ${isComingSoon ? 'locked' : 'available'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => {
        if (isAvailable) {
          handleCourseClick(playlist);
        }
      }}
    >
      {/* Popup Preview */}
      {isAvailable && (
        <div className="popup-preview">
          <div className="popup-thumbnail-container">
            {popupThumbnailUrl ? (
              <img 
                src={popupThumbnailUrl} 
                alt={`${playlist.name || 'Course'} Preview`} 
                className="popup-thumbnail"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://img.youtube.com/vi/${playlist.videoId}/hqdefault.jpg`;
                }}
              />
            ) : (
              <div className="popup-thumbnail-placeholder">No Preview</div>
            )}
          </div>
          <div className="popup-info">
            <h4>{playlist.name || 'Course Details'}</h4>
            <p>{playlist.description || 'No description available.'}</p>
          </div>
        </div>
      )}

      {/* Main Card Thumbnail */}
      <div className="thumbnail-container">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={playlist.name || 'Course thumbnail'} 
            className="course-thumbnail"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://img.youtube.com/vi/${playlist.videoId}/hqdefault.jpg`;
            }}
          />
        ) : (
          <div className="thumbnail-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="placeholder-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-1.5H3.75V6H20.25v12Z" />
            </svg>
            <span>Thumbnail Missing</span>
            <span className="placeholder-course-name">{playlist.name || 'Course'}</span>
          </div>
        )}

        {/* Lock Overlay */}
        {isComingSoon && (
          <div className="coming-soon-overlay">
            <div className="lock-container">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="lock-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span className="coming-soon-text">Coming Soon</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="course-info">
        <h3 className="course-title">{playlist.name || 'Unnamed Course'}</h3>
        {isAvailable && (
          <>
            <div className="rating-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="rating-star-icon">
                <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.681 4.06c.07.17.229.288.408.308l4.471.651c.807.118 1.13.964.548 1.508l-3.235 3.153a.494.494 0 0 0-.143.437l.764 4.452c.138.803-.703 1.415-1.415 1.013l-3.994-2.1a.49.49 0 0 0-.458 0l-3.994 2.1c-.712.402-1.553-.21-1.415-1.013l.764-4.452a.495.495 0 0 0-.143-.437L1.54 9.41c-.582-.544-.259-1.39.548-1.508l4.471-.651a.496.496 0 0 0 .408-.308l1.681-4.06Z" clipRule="evenodd" />
              </svg>
              <span className="course-rating">
                {playlist.average_rating ? playlist.average_rating.toFixed(1) : "N/A"}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCourseClick(playlist);
              }}
              className="course-button"
            >
              Start Course
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
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Define ALL courses here
  const allCourseData = [
    {
      // C++ course remains unchanged
      id: "cpp-course-id",
      name: "C++ Programming",
      description: "Learn C++ programming concepts.",
      videoId: "8jLOx1hD3_o",
      comingSoon: false,
      average_rating: 4.5,
      isFetched: false,
    },
    {
      id: "python-intro-1",
      name: "Introduction to Python",
      description:
        "Learn the fundamentals of Python programming. Covers variables, data types, loops, functions, and more.",
      videoId: "_uQrJ0TkZlc",
      comingSoon: true, // Keep Python as a coming soon course
      average_rating: 4.7,
    },
    {
      id: "math-concepts-1",
      name: "Comprehensive Mathematics",
      description:
        "Playlist covering a wide range of mathematical topics by Professor Dave Explains.",
      videoId: "kjBOesZCoqc", // New math course video ID for proper thumbnail
      comingSoon: true,
      average_rating: 4.8,
    },
    {
      id: "logical-algebra-1",
      name: "Boolean Algebra & Logic Gates",
      description:
        "In-depth video on logic gates, truth tables, and Boolean algebra by The Organic Chemistry Tutor.",
      videoId: "WW-NPtIzHwk",
      comingSoon: true,
      average_rating: 4.9,
    },
  ];

  useEffect(() => {
    const fetchAndSetCourses = async () => {
      setLoading(true);
      setError("");
      let finalCourses = [...allCourseData];

      try {
        const response = await axios.get("/courses");
        if (response.data && response.data.length > 0) {
          const fetchedCppCourse = response.data.find(
            (course) => course.name === "C++ Programming"
          );
          if (fetchedCppCourse) {
            const cppIndex = finalCourses.findIndex(
              (c) => c.videoId === "8jLOx1hD3_o"
            );
            if (cppIndex !== -1) {
              finalCourses[cppIndex] = {
                ...finalCourses[cppIndex],
                id: fetchedCppCourse.id || finalCourses[cppIndex].id,
                name: fetchedCppCourse.name || finalCourses[cppIndex].name,
                description:
                  fetchedCppCourse.description ||
                  finalCourses[cppIndex].description,
                average_rating:
                  fetchedCppCourse.average_rating ||
                  finalCourses[cppIndex].average_rating,
                comingSoon: false, // Ensure C++ remains unlocked
                isFetched: true,
              };
            }
          } else {
            console.warn(
              "C++ course data not found in API response. Using defaults."
            );
            const cppIndex = finalCourses.findIndex(
              (c) => c.videoId === "8jLOx1hD3_o"
            );
            if (cppIndex !== -1) {
              finalCourses[cppIndex].comingSoon = false;
            }
          }
        } else {
          console.warn(
            "API did not return any course data. Using default course structure."
          );
          const cppIndex = finalCourses.findIndex(
            (c) => c.videoId === "8jLOx1hD3_o"
          );
          if (cppIndex !== -1) {
            finalCourses[cppIndex].comingSoon = false;
          }
        }
        setPlaylists(finalCourses);
      } catch (err) {
        console.error("Error fetching or processing courses:", err);
        setError(
          "Could not load course list accurately. Displaying default structure."
        );
        const cppIndex = finalCourses.findIndex(
          (c) => c.videoId === "8jLOx1hD3_o"
        );
        if (cppIndex !== -1) {
          finalCourses[cppIndex].comingSoon = false;
        }
        setPlaylists(finalCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetCourses();
  }, []);

  // Slider Settings
  const sliderSettings = {
    dots: true,
    infinite: playlists.length > 3,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    centerMode: false,
    customPaging: (i) => <div className="custom-dot" />,
    appendDots: (dots) => (
      <ul className="slick-dots-container">{dots}</ul>
    ),
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: false } },
    ],
  };

  const handleCourseClick = (playlist) => {
    if (!playlist.comingSoon) {
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        if (playlist.id) {
          navigate(`/form_test/${playlist.id}`);
        } else {
          console.error(
            "Missing ID for navigation on playlist:",
            playlist
          );
          setError("Could not navigate to the course test (missing ID).");
        }
      }
    }
  };

  return (
    <motion.div
      className="home-video-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title">Explore Our Courses</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : playlists.length > 0 ? (
        <Slider
          {...sliderSettings}
          slidesToShow={Math.min(3, playlists.length)}
          className="slider-container"
        >
          {playlists.map((playlist, index) => (
            <div
              key={
                playlist.id ||
                simpleHash(playlist.videoId || index.toString())
              }
              className="slide-item"
            >
              <PlaylistCard
                playlist={playlist}
                handleCourseClick={handleCourseClick}
                index={index}
              />
            </div>
          ))}
        </Slider>
      ) : (
        <p className="no-courses-message">
          No courses are currently available.
        </p>
      )}
    </motion.div>
  );
};

export default HomeVideo;
