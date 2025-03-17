import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeTask from "./CodeTask";
import axios from "../api/axios";
import "../App.css";
import { debounce } from "lodash";

const convertTimestampToSeconds = (timestamp) => {
  if (!timestamp) return 0;
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
};

const convertSecondsToTimestamp = (seconds) => {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

const YouTubeEmbed = ({ playlistId }) => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [lastWatchedTimestamp, setLastWatchedTimestamp] = useState("00:00:00");
  const [playerVideoId, setPlayerVideoId] = useState(null);
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const taskTriggeredRef = useRef(false);

  // Calculate progress percentage
  const progressPercentage =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Load saved timestamp from localStorage on mount
  useEffect(() => {
    const storedTimestamp = localStorage.getItem("lastWatchedTimestamp");
    if (storedTimestamp) {
      setLastWatchedTimestamp(storedTimestamp);
    }
  }, []);

  // Debounced save progress function (10-second delay)
  const debouncedSaveProgress = useCallback(
    debounce(async (seconds) => {
      try {
        const timestamp = convertSecondsToTimestamp(seconds);
        localStorage.setItem("lastWatchedTimestamp", timestamp);
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        await axios.post(
          "/user-progress",
          {
            video_id: String(playerVideoId),
            last_timestamp: timestamp,
            playlist_id: playlistId,
          },
          { headers }
        );
        console.log("Progress saved:", timestamp);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        } else {
          console.error("Error saving progress:", error);
        }
      }
    }, 10000),
    [playerVideoId, playlistId]
  );

  // Helper: Re-fetch progress from backend after a task is completed
  const fetchProgress = async (videoId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("/user-progress", { params: { video_id: String(videoId) }, headers });
      if (response.data && response.data.data) {
        setCompletedTasks(response.data.data.completed_tasks || []);
        setLastWatchedTimestamp(response.data.data.last_timestamp || "00:00:00");
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  // Fetch tasks and progress on mount / when playlistId changes
  useEffect(() => {
    const fetchTasksAndProgress = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const playlistResponse = await axios.get(`/playlists/${playlistId}`, { headers });
        const videoId = String(playlistResponse.data.video_id);
        const [tasksResponse, progressResponse] = await Promise.all([
          axios.get(`/tasks/${playlistId}`, { headers }),
          axios.get("/user-progress", { params: { video_id: videoId }, headers }),
        ]);

        // Sort tasks by timestamp so they trigger in order
        const tasksData = tasksResponse.data || [];
        tasksData.sort((a, b) => convertTimestampToSeconds(a.timestamp) - convertTimestampToSeconds(b.timestamp));
        setTasks(tasksData);

        // Update progress from backend if available
        if (progressResponse.data && progressResponse.data.data) {
          setCompletedTasks(progressResponse.data.data.completed_tasks || []);
          setLastWatchedTimestamp(progressResponse.data.data.last_timestamp || "00:00:00");
        } else {
          setCompletedTasks([]);
          setLastWatchedTimestamp("00:00:00");
        }
        setPlayerVideoId(videoId);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        } else {
          console.error("Error fetching tasks or progress:", error);
        }
      }
    };

    fetchTasksAndProgress();
  }, [playlistId]);

  // Load YouTube Iframe API and initialize player
  useEffect(() => {
    if (!lastWatchedTimestamp || !playerVideoId) return;
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      } else {
        onYouTubeIframeAPIReady();
      }
    };

    const onYouTubeIframeAPIReady = () => {
      if (playerInstanceRef.current) return;
      if (!playerRef.current) return;
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: playerVideoId,
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            if (lastWatchedTimestamp && lastWatchedTimestamp !== "00:00:00") {
              const lastTimestampInSeconds = convertTimestampToSeconds(lastWatchedTimestamp);
              event.target.seekTo(lastTimestampInSeconds, true);
              console.log("Resuming video at:", lastWatchedTimestamp);
            }
          },
          onStateChange: handlePlayerStateChange,
        },
        playerVars: {
          autoplay: 0,
          controls: 1,
          enablejsapi: 1,
        },
      });
    };

    loadYouTubeAPI();
  }, [lastWatchedTimestamp, playerVideoId]);

  // Ensure video is paused when a task is active
  useEffect(() => {
    if (currentTaskIndex !== null && playerInstanceRef.current) {
      playerInstanceRef.current.pauseVideo();
    }
  }, [currentTaskIndex]);

  // Pause video when playing if a task is active (fallback)
  const handlePlayerStateChange = useCallback(
    (event) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        if (currentTaskIndex !== null) {
          event.target.pauseVideo();
        } else {
          taskTriggeredRef.current = false;
        }
      }
    },
    [currentTaskIndex]
  );

  // Mark task as completed, update backend, and refresh progress state
  const handleTaskComplete = useCallback(async () => {
    if (currentTaskIndex !== null) {
      const currentTask = tasks[currentTaskIndex];
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.post(
          "/user-progress/tasks",
          { video_id: String(playerVideoId), task_id: String(currentTask.id) },
          { headers }
        );
        if (res.data && res.data.data) {
          setCompletedTasks(res.data.data.completed_tasks || []);
        } else {
          setCompletedTasks((prev) => [...prev, String(currentTask.id)]);
        }
        await fetchProgress(playerVideoId);
      } catch (error) {
        console.error("Error completing task:", error);
      }
      setCurrentTaskIndex(null);
      if (playerReady && playerInstanceRef.current) {
        playerInstanceRef.current.playVideo();
      }
    }
  }, [currentTaskIndex, tasks, playerVideoId, playerReady]);

  // Check for upcoming tasks based on current video time (skip those already completed)
  useEffect(() => {
    if (!playerInstanceRef.current || !tasks.length || !playerReady) return;
    const interval = setInterval(() => {
      try {
        const currentTime = Math.floor(playerInstanceRef.current.getCurrentTime());
        if (taskTriggeredRef.current) return;
        const nextTaskIndex = tasks.findIndex(
          (task) =>
            currentTime >= convertTimestampToSeconds(task.timestamp) &&
            !completedTasks.includes(String(task.id))
        );
        if (nextTaskIndex !== -1 && nextTaskIndex !== currentTaskIndex) {
          setCurrentTaskIndex(nextTaskIndex);
          playerInstanceRef.current.pauseVideo();
          taskTriggeredRef.current = true;
        }
      } catch (error) {
        console.warn("Error during task checking:", error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks, completedTasks, currentTaskIndex, playerReady]);

  // Save video progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        playerInstanceRef.current &&
        playerReady &&
        typeof playerInstanceRef.current.getCurrentTime === "function"
      ) {
        try {
          const currentTime = Math.floor(playerInstanceRef.current.getCurrentTime());
          if (currentTime > 0) {
            debouncedSaveProgress(currentTime);
          }
        } catch (error) {
          console.warn("Error saving progress:", error);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [playerReady, debouncedSaveProgress]);

  // Auto-scroll the playlist sidebar to the active task
  useEffect(() => {
    if (currentTaskIndex !== null && tasks.length > 0) {
      const activeTaskId = tasks[currentTaskIndex].id;
      const element = document.getElementById(`playlist-item-${activeTaskId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTaskIndex, tasks]);

  return (
    <div className="youtube-layout-container">
      {/* Left Column: Video (with progress bar) and Code Task */}
      <div className="left-column">
        <div className="video-progress-container">
          <div className={`video-container ${currentTaskIndex === null ? "" : "hidden"}`}>
            <div className="youtube-player" ref={playerRef} id="player"></div>
          </div>
          <div className="course-progress-bar">
            <div className="course-progress-bar-inner" style={{ width: progressPercentage + "%" }}>
              <span className="progress-percent">{progressPercentage}%</span>
            </div>
          </div>
        </div>
        {tasks.length > 0 && currentTaskIndex !== null && (
          <div className="code-task-container">
            <CodeTask task={tasks[currentTaskIndex]} onTaskComplete={handleTaskComplete} />
          </div>
        )}
      </div>
      {/* Right Column: Scrollable Playlist Sidebar */}
      <div className="playlist-sidebar">
        <h3>Playlist</h3>
        <ul>
          {tasks.map((task) => {
            const isActive = currentTaskIndex !== null && tasks[currentTaskIndex].id === task.id;
            const isCompleted = completedTasks.includes(String(task.id));
            return (
              <li
                key={task.id}
                id={`playlist-item-${task.id}`}
                className={`playlist-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              >
                {task.title}
                {isCompleted && <span className="checkmark"> ✔️</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default YouTubeEmbed;
