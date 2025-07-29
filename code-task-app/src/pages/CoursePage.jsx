import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import YouTubeEmbed from "../components/YouTubeEmbed";
import CommentSection from "../components/CommentSection";
import Playlists from "../components/Playlists";
import "../App.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState("00:00:00");

  // Comments state and user
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [locked, setLocked] = useState(false);

  // Fetch user and comments
  useEffect(() => {
    const fetchUserAndComments = async () => {
      setCommentsLoading(true);
      try {
        // Get user from localStorage or API
        const userStr = localStorage.getItem("user");
        let userObj = userStr ? JSON.parse(userStr) : null;
        if (!userObj) {
          const token = localStorage.getItem("token") || localStorage.getItem("authToken");
          if (token) {
            const res = await axios.get("/user", { headers: { Authorization: `Bearer ${token}` } });
            userObj = res.data;
            localStorage.setItem("user", JSON.stringify(userObj));
          }
        }
        setUser(userObj);
        // Fetch comments for this course
        const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
        setComments(res.data);
        setCommentsError("");
      } catch (err) {
        setCommentsError("Failed to load comments.");
      }
      setCommentsLoading(false);
    };
    if (courseId) fetchUserAndComments();
  }, [courseId]);

  // تحميل حالة الاشتراك دائماً بعد تحميل المستخدم
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          const res = await axios.get('/subscription/status', { headers: { Authorization: `Bearer ${token}` } });
          setSubscriptionStatus(res.data);
        } else {
          setSubscriptionStatus(null);
        }
      } catch (err) {
        setSubscriptionStatus(null);
      }
    };
    if (user) fetchSubscriptionStatus();
  }, [user]);

  // Handler functions for CommentSection
  const handleAddComment = async (content) => {
    if (!content.trim()) return;
    try {
      await axios.post(`/courses/${courseId}/comments`, { content });
      // Refetch comments
      const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
      setComments(res.data);
    } catch {}
  };
  const handleEditComment = async (id, content) => {
    if (!content.trim()) return;
    try {
      await axios.put(`/comments/${id}`, { content });
      const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
      setComments(res.data);
    } catch {}
  };
  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(`/comments/${id}`);
      const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
      setComments(res.data);
    } catch {}
  };
  const handleLikeComment = async (id) => {
    try {
      await axios.post(`/comments/${id}/like`, { type: "like" });
      const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
      setComments(res.data);
    } catch {}
  };
  const handleDislikeComment = async (id) => {
    try {
      await axios.post(`/comments/${id}/like`, { type: "dislike" });
      const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
      setComments(res.data);
    } catch {}
  };
  const handleReplyComment = async (parentId, content) => {
    if (!content.trim()) return;
    try {
      await axios.post(`/comments/${parentId}/reply`, { content });
      const res = await axios.get(`/courses/${courseId}/comments?sort=newest`);
      setComments(res.data);
    } catch {}
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch course details (includes tasks)
        const courseResponse = await axios.get(`/courses/${courseId}`);
        const courseData = courseResponse.data;
        setCourse(courseData);
        
        // Use tasks that are already included in the course data
        const sortedTasks = (courseData.tasks || []).sort(
          (a, b) => {
            const timeA = a.timestamp ? a.timestamp.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0) : 0;
            const timeB = b.timestamp ? b.timestamp.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0) : 0;
            return timeA - timeB;
          }
        );
        setTasks(sortedTasks);

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
      toast.success('🎉 Course unlocked successfully! Enjoy your new course.', {
        position: 'top-center',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#e0f7fa',
          color: '#00695c',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          borderRadius: '10px',
          boxShadow: '0 2px 12px #b2dfdb',
        },
        icon: '✅',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to unlock course.", {
        position: 'top-center',
        autoClose: 3500,
        style: {
          background: '#ffebee',
          color: '#b71c1c',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          borderRadius: '10px',
        },
        icon: '❌',
      });
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

                {/* ملخص الإجمالي */}
                <div style={{ marginTop: "10px", color: "#0369a1" }}>
                  <b>Total Remaining Courses:</b> {subscriptionStatus.total_remaining_courses} of {subscriptionStatus.total_allowed_courses}
                </div>
                <div style={{ color: "#0369a1" }}>
                  <b>Total Used Courses:</b> {subscriptionStatus.total_used_courses}
                </div>
              </div>
              {subscriptionStatus.total_remaining_courses > 0 ? (
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
                  Unlock this course ({subscriptionStatus.total_remaining_courses} courses remaining)
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
                    No remaining courses in your current subscriptions
                  </p>
                  <p style={{ margin: "10px 0 0 0" }}>
                    You can upgrade your subscription or purchase a new plan
                  </p>
                  <button 
                    onClick={() => navigate("/subscription-plans", { state: { courseId: course.id } })}
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
                onClick={() => navigate("/subscription-plans", { state: { courseId: course.id } })}
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
        renderComments={
          <CommentSection
            comments={comments}
            setComments={setComments}
            user={user}
            onAddComment={handleAddComment}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
            onDislike={handleDislikeComment}
            onReply={handleReplyComment}
          />
        }
      />
      {/* Removed Course Tasks/Playlists section here */}
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <h2>This course is locked</h2>
          <p>Please unlock this course to access its content.</p>
        </div>
      )}
    </div>
  );
  

  return (
    <div style={{ marginTop: "80px", padding: "0 20px" }}>
      <YouTubeEmbed 
        videoId={course.video_id} 
        playlistId={course.id} 
        tasks={tasks}
        completedTasks={completedTasks}
        onTaskComplete={handleTaskComplete}
        initialTimestamp={lastTimestamp}
        renderComments={
          <CommentSection
            comments={comments}
            setComments={setComments}
            user={user}
            onAddComment={handleAddComment}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
            onDislike={handleDislikeComment}
            onReply={handleReplyComment}
          />
        }
      />
    </div>
  );
};

export default CoursePage;
