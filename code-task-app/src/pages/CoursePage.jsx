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
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);

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
        
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleTaskComplete = (taskId) => {
    setCompletedTasks(prev => [...prev, taskId]);
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
        onTaskComplete={handleTaskComplete}
      />
      {/* Optionally, you can include the Playlists sidebar if needed */}
      <div style={{ marginTop: "20px" }}>
        <Playlists currentTaskIndex={currentTaskIndex} tasks={tasks} />
      </div>
    </div>
  );
};

export default CoursePage; 