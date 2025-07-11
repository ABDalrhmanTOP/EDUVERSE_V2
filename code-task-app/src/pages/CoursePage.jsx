import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import YouTubeEmbed from "../components/YouTubeEmbed";
import Playlists from "../components/Playlists";
import "../App.css";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [locked, setLocked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const isSubscribed = false;
  const [lastTimestamp, setLastTimestamp] = useState("00:00:00");


  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch course details (includes tasks)
        const courseResponse = await axios.get(`/courses/${courseId}`);
        const courseData = courseResponse.data;
        setCourse(courseData);
        setIsUnlocked(courseData.is_unlocked || false);
        
        // Use tasks that are already included in the course data
        const sortedTasks = (courseData.tasks || []).sort(
          (a, b) => {
            const timeA = a.timestamp ? a.timestamp.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0) : 0;
            const timeB = b.timestamp ? b.timestamp.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0) : 0;
            return timeA - timeB;
          }
        );
        setTasks(sortedTasks);
        
        // Fetch subscription status if course is paid
        if (courseData.paid) {
          try {
            const subscriptionResponse = await axios.get('/subscription/status');
            setSubscriptionStatus(subscriptionResponse.data);
          } catch (err) {
            console.error('Error fetching subscription status:', err);
          }
        }
        
        // Load user progress (both video progress and completed tasks)
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          try {
            // Always use both video_id and playlist_id for progress
            const progressResponse = await axios.get(
              `/user-progress?playlist_id=${courseId}&video_id=${courseData.video_id}`,
              { headers }
            );
            if (progressResponse.data && progressResponse.data.data) {
              const progress = progressResponse.data.data;
              if (progress.last_timestamp) {
                setLastTimestamp(progress.last_timestamp);
              } else {
                setLastTimestamp("00:00:00");
              }
              if (progress.completed_tasks && Array.isArray(progress.completed_tasks)) {
                setCompletedTasks(progress.completed_tasks.map(String));
              } else {
                setCompletedTasks([]);
              }
            } else {
              // No progress found, reset state
              setLastTimestamp("00:00:00");
              setCompletedTasks([]);
            }
          } catch (progressError) {
            // If progress loading fails, try loading just completed tasks as fallback
            try {
              const tasksResponse = await axios.get(
                `/user-progress/tasks?playlist_id=${courseId}&video_id=${courseData.video_id}`,
                { headers }
              );
              if (tasksResponse.data && tasksResponse.data.completed_tasks) {
                setCompletedTasks(tasksResponse.data.completed_tasks.map(String));
              } else {
                setCompletedTasks([]);
              }
              setLastTimestamp("00:00:00");
            } catch (tasksError) {
              setCompletedTasks([]);
              setLastTimestamp("00:00:00");
            }
          }
        } else {
          // No token, force login
          setError("You are not logged in. Please login to continue.");
        }

      } catch (err) {
        setError("Failed to load course. Please try again.");
      } finally {
        setLoading(false);
        setLoadingSubscription(false);
      }
    };
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);


  const handleUnlockCourse = async () => {
    try {
      await axios.post(`/courses/${course.id}/unlock`);
      setIsUnlocked(true);
      alert("Course unlocked successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to unlock course.");
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      // Save completed task to backend, always send both video_id and playlist_id
      await axios.post(
        "/user-progress/tasks",
        {
          task_id: taskId,
          playlist_id: courseId,
          video_id: course?.video_id,
        },
        { headers }
      );
      // Update local state optimistically
      setCompletedTasks(prev => {
        const taskIdStr = String(taskId);
        if (!prev.includes(taskIdStr)) {
          return [...prev, taskIdStr];
        }
        return prev;
      });
    } catch (error) {
      // Optionally show error to user
    }
  };

  if (loading) {
    return (
      <div style={{ marginTop: "80px", padding: "20px", textAlign: "center" }}>
        <div>Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: "80px", padding: "20px", textAlign: "center" }}>
        <div style={{ color: "red" }}>{error}</div>
        <button 
          onClick={() => navigate("/homevideo")}
          style={{ 
            marginTop: "20px", 
            padding: "10px 20px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px", 
            cursor: "pointer" 
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ marginTop: "80px", padding: "20px", textAlign: "center" }}>
        <div>Course not found.</div>
        <button 
          onClick={() => navigate("/homevideo")}
          style={{ 
            marginTop: "20px", 
            padding: "10px 20px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px", 
            cursor: "pointer" 
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (locked) {
    return (
      <div style={{ marginTop: "80px", textAlign: "center" }}>
        <h2>Video Locked</h2>
        <p>To continue, please subscribe to the course.</p>
        <button onClick={() => navigate("/subscription")}>Subscribe Now</button>
      </div>
    );
  }

  const currentTaskIndex = tasks.findIndex(
    (task) => !completedTasks.includes(String(task.id))
  );

  return (
    <div style={{ marginTop: "80px", padding: "0 20px" }}>
      {course.paid && !isUnlocked && (
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          {subscriptionStatus && subscriptionStatus.has_active_subscription ? (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ 
                padding: "15px", 
                backgroundColor: "#f0f9ff", 
                border: "1px solid #0ea5e9", 
                borderRadius: "8px",
                marginBottom: "15px"
              }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0c4a6e" }}>
                  Subscription Information
                </h4>
                <p style={{ margin: "5px 0", color: "#0369a1" }}>
                  Plan: {subscriptionStatus.subscription.plan_name}
                </p>
                <p style={{ margin: "5px 0", color: "#0369a1" }}>
                  Remaining Courses: {subscriptionStatus.remaining_courses} of {subscriptionStatus.total_allowed_courses}
                </p>
                <p style={{ margin: "5px 0", color: "#0369a1" }}>
                  Subscription End Date: {new Date(subscriptionStatus.subscription.end_date).toLocaleDateString('en-US')}
                </p>
              </div>
              {subscriptionStatus.remaining_courses > 0 ? (
                <button
                  onClick={handleUnlockCourse}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}
                >
                  Unlock this course ({subscriptionStatus.remaining_courses} courses remaining)
                </button>
              ) : (
                <div style={{ 
                  padding: "15px", 
                  backgroundColor: "#fef2f2", 
                  border: "1px solid #ef4444", 
                  borderRadius: "8px",
                  color: "#dc2626"
                }}>
                  <p style={{ margin: "0", fontWeight: "bold" }}>
                    No remaining courses in your current subscription
                  </p>
                  <p style={{ margin: "10px 0 0 0" }}>
                    You can upgrade your subscription or purchase a new plan
                  </p>
                  <button 
                    onClick={() => navigate("/subscription-plans")}
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Upgrade Subscription
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              padding: "20px", 
              backgroundColor: "#fef2f2", 
              border: "1px solid #ef4444", 
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <h3 style={{ margin: "0 0 15px 0", color: "#dc2626" }}>
                This course requires a subscription
              </h3>
              <p style={{ margin: "0 0 15px 0", color: "#991b1b" }}>
                To access this course, please subscribe to one of our plans
              </p>
              <button 
                onClick={() => navigate("/subscription-plans")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Subscribe Now
              </button>
            </div>
          )}
        </div>
      )}
      {(!course.paid || isUnlocked) ? (
        <>
      <YouTubeEmbed 
        videoId={course.video_id} 
        playlistId={course.id}
        tasks={tasks}
        completedTasks={completedTasks}
        onTaskComplete={handleTaskComplete}
        initialTimestamp={lastTimestamp}
      />

      <div style={{ marginTop: "20px" }}>
        <Playlists currentTaskIndex={currentTaskIndex} tasks={tasks} />
      </div>
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <h2>This course is locked</h2>
          <p>Please unlock this course to access its content.</p>
        </div>
      )}
    </div>
  );
};

export default CoursePage;
