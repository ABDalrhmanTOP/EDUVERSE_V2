import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { ProgressBar } from "react-bootstrap";  // Bootstrap ProgressBar component

const VIDEO_DURATION = 112049; // Total duration in seconds (1:07:07:29)

const UserProgressTable = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [usersProgress, setUsersProgress] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`user-progress/user/${user_id || "all"}`)
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
  }, [user_id]);

  // Converts a timestamp string to total seconds.
  // Supports 4-part format: d:hh:mm:ss, 3-part: hh:mm:ss, 2-part: mm:ss, 1-part: ss.
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

  // Calculate progress percentage based on the last timestamp.
  const calculateProgress = (timestamp) => {
    const seconds = convertToSeconds(timestamp);
    if (!seconds || seconds <= 0) return 0;
    const percentage = (seconds * 100) / VIDEO_DURATION;
    return percentage.toFixed(2); // Round to two decimal places
  };

  return (
    <div className="container my-4 p-4  rounded shadow" style={{ backgroundColor: '#EAE0D5' }}>
      <h2 className="mb-4 text-center text-primary fw-bold">User Progress Management</h2>
      
      {loading ? (
        <div className="alert alert-info text-center">Loading data...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive mt-3">
          <Outlet />
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

export default UserProgressTable;
