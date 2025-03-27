import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { ProgressBar } from "react-bootstrap";  // مكون شريط التقدم من Bootstrap

const VIDEO_DURATION = 108000; // مدة الفيديو بالثواني (4 ساعات)

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


  const convertToSeconds = (timeString) => {
    if (!timeString) return 0;
  
    const parts = timeString.split(":").map(Number);
    let seconds = 0;
  
    if (parts.length === 3) {
      // hh:mm:ss
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // mm:ss
      seconds = parts[0] * 60 + parts[1];
    } else {
      // ss فقط
      seconds = parts[0];
    }
  
    return seconds;
  };
  
  const calculateProgress = (timestamp) => {
    const seconds = convertToSeconds(timestamp); // تحويل الطابع الزمني إلى ثوانٍ
  
    if (!seconds || seconds <= 0) return 0;
    
    const percentage = (((seconds * 100)) / VIDEO_DURATION);
    return percentage.toFixed(2); // تقريب النسبة لرقمين عشريين
  };
  

  return (
    <div className="container my-4 p-4 bg-white rounded shadow">
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
                      <td>{user.last_timestamp} </td>
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
        <button className="btn btn-secondary px-4 py-2" onClick={() => navigate(`/AdminDashboard/users`)}>Back to Users</button>
      </div>
    </div>
  );
};

export default UserProgressTable;
