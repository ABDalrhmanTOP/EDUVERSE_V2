import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import YouTubeEmbed from "../components/YouTubeEmbed";
import CommentSection from "../components/CommentSection";
import "../App.css";

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