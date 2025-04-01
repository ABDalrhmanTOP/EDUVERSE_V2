// src/components/CoursesDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { ProgressBar } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CoursesDashboard.css"; // custom CSS for dashboard

const VIDEO_DURATION = 112049; // example duration

// This component displays the admin progress table.
const UserProgressTable = () => {
  const [usersProgress, setUsersProgress] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`user-progress/user/all`)
      .then(response => {
        setUsersProgress(response.data);
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching user progress:", error);
        setError("Failed to fetch user progress. Please try again.");
        setUsersProgress([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Converts a timestamp string (d:hh:mm:ss, hh:mm:ss, etc.) to seconds.
  const convertToSeconds = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.split(":").map(Number);
    if (parts.length === 4) {
      const [days, hours, minutes, seconds] = parts;
      return days * 86400 + hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    } else {
      return Number(parts[0]);
    }
  };

  const calculateProgress = (timestamp) => {
    const seconds = convertToSeconds(timestamp);
    if (!seconds || seconds <= 0) return 0;
    const percentage = (seconds * 100) / VIDEO_DURATION;
    return percentage.toFixed(2);
  };

  return (
    <div className="admin-progress-table container my-4 p-4 bg-white rounded shadow">
      <h2 className="mb-4 text-center text-primary fw-bold">User Progress Management</h2>
      {loading ? (
        <div className="alert alert-info text-center">Loading data...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-striped table-hover table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>User ID</th>
                <th>Video ID</th>
                <th>Last Timestamp</th>
                <th>Completion (%)</th>
                <th>Completed Tasks</th>
              </tr>
            </thead>
            <tbody>
              {usersProgress.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">No data available</td>
                </tr>
              ) : (
                usersProgress.map((user, index) => {
                  const progress = calculateProgress(user.last_timestamp);
                  return (
                    <tr key={index}>
                      <td>{user.user_id}</td>
                      <td>{user.video_id}</td>
                      <td>{user.last_timestamp}</td>
                      <td>
                        <div className="d-flex flex-column align-items-center">
                          <span className="fw-bold">{progress}%</span>
                          <ProgressBar 
                            now={progress} 
                            variant={progress > 75 ? "success" : progress > 50 ? "warning" : "danger"} 
                            style={{ width: "150px", height: "10px" }}
                          />
                        </div>
                      </td>
                      <td>{user.completed_tasks?.length > 0 ? user.completed_tasks.join(", ") : "No tasks completed"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-center mt-4">
        <button className="btn btn-secondary px-4 py-2" onClick={() => navigate(`/AdminDashboard/users`)}>
          Back to Users
        </button>
      </div>
    </div>
  );
};

// This component displays available courses (playlists) with average rating.
const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get("/courses");
        setPlaylists(response.data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setError("Failed to load courses, please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Available Courses
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center items-center h-72">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <Slider {...settings} className="w-full max-w-screen-lg mx-auto">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div key={playlist.id} className="px-2">
                <PlaylistCard playlist={playlist} />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">
              No courses available at the moment.
            </p>
          )}
        </Slider>
      )}
    </div>
  );
};

const PlaylistCard = ({ playlist }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCourses = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/foem_test");
    }
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      onClick={handleCourses}
    >
      <img
        src={
          playlist.thumbnail ||
          `https://img.youtube.com/vi/${playlist.video_id}/hqdefault.jpg`
        }
        alt={playlist.name}
        className="w-full h-[500px] object-cover"
      />
      <div className="absolute inset-0 z-10 bg-black bg-opacity-60 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6">
        <h3 className="text-white text-2xl font-bold mb-3 text-center">
          {playlist.name}
        </h3>
        <p className="text-white text-md mb-4 text-center max-w-md">
          {playlist.description}
        </p>
        <p className="text-white text-sm mb-2">
          Average Rating: {playlist.average_rating ? playlist.average_rating : "N/A"}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCourses();
          }}
          className="bg-blue-600 text-white py-3 px-6 rounded-full shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Watch the Course
        </button>
      </div>
    </motion.div>
  );
};

const CoursesDashboard = () => {
  const { isAdmin } = useAuth(); // assume isAdmin flag from auth context

  return (
    <>
      <Playlists />
      {isAdmin && <UserProgressTable />}
      <Outlet />
    </>
  );
};

export default CoursesDashboard;
