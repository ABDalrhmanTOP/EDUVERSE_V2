// src/pages/VideoPage.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import YouTubeEmbed from "../components/YouTubeEmbed";
import "../App.css";

const VideoPage = () => {
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    axios
      .get("/tasks/1")
      .then((res) => {
        setTasks(res.data);
      })
      .catch((err) => {
        // Remove console.error statements for production readiness
      });
  }, []);

  return (
    // Add marginTop to shift content down so the navbar doesn't overlap
    <div style={{ marginTop: "80px", padding: "0 20px" }}>
      <YouTubeEmbed videoId="8jLOx1hD3_o" playlistId={1} tasks={tasks} />
    </div>
  );
};

export default VideoPage;
