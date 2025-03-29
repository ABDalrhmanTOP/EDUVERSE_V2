import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeTask from "./CodeTask";
import axios from "../api/axios";
import "../App.css";
import { debounce } from "lodash";

// Converts a timestamp string to total seconds.
// Supports formats: d:hh:mm:ss, hh:mm:ss, mm:ss, ss.
const convertTimestampToSeconds = (timestamp) => {
  if (!timestamp) return 0;
  const parts = timestamp.split(":").map(Number);
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

// Converts seconds into a hh:mm:ss formatted string.
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
  const [maxTimeReached, setMaxTimeReached] = useState(0);
  const [playerVideoId, setPlayerVideoId] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0); // in percentage
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const taskTriggeredRef = useRef(false);

  // Load saved timestamp on mount.
  useEffect(() => {
    const storedTimestamp = localStorage.getItem("lastWatchedTimestamp");
    if (storedTimestamp) {
      setLastWatchedTimestamp(storedTimestamp);
      setMaxTimeReached(convertTimestampToSeconds(storedTimestamp));
    }
  }, []);

  // Debounced function to save progress every 10 seconds.
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

  // Helper to re-fetch progress from backend.
  const fetchProgress = async (videoId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("/user-progress", {
        params: { video_id: String(videoId) },
        headers,
      });
      if (response.data && response.data.data) {
        // Corrected: using response instead of an undefined variable.
        setCompletedTasks(response.data.data.completed_tasks || []);
        setLastWatchedTimestamp(response.data.data.last_timestamp || "00:00:00");
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  // Fetch tasks and progress when component mounts or playlistId changes.
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

        const tasksData = tasksResponse.data || [];
        tasksData.sort(
          (a, b) =>
            convertTimestampToSeconds(a.timestamp) - convertTimestampToSeconds(b.timestamp)
        );
        setTasks(tasksData);

        if (progressResponse.data && progressResponse.data.data) {
          // Corrected: use progressResponse instead of response.
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

  // Load YouTube Iframe API and initialize player.
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
          rel: 0, // Only show related videos from the same channel at the end
          modestbranding: 1, // Remove YouTube logo from the control bar
        }
      });
    };

    loadYouTubeAPI();
  }, [lastWatchedTimestamp, playerVideoId]);

  // Update video progress and maxTimeReached.
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (
        playerInstanceRef.current &&
        playerReady &&
        typeof playerInstanceRef.current.getCurrentTime === "function"
      ) {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        setMaxTimeReached((prevMax) => {
          const newMax = currentTime > prevMax ? currentTime : prevMax;
          const VIDEO_DURATION = 112049; // Total duration in seconds
          setVideoProgress(Math.round((newMax * 100) / VIDEO_DURATION));
          return newMax;
        });
      }
    }, 1000);
    return () => clearInterval(progressInterval);
  }, [playerReady]);

  // Save progress periodically using maxTimeReached.
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        playerInstanceRef.current &&
        playerReady &&
        typeof playerInstanceRef.current.getCurrentTime === "function"
      ) {
        debouncedSaveProgress(maxTimeReached);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [playerReady, maxTimeReached, debouncedSaveProgress]);

  // Pause video when a task is active.
  useEffect(() => {
    if (currentTaskIndex !== null && playerInstanceRef.current) {
      playerInstanceRef.current.pauseVideo();
    }
  }, [currentTaskIndex]);

  // Pause video if playing and a task is active (fallback).
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

  // Mark task as completed and update backend.
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
      // Exit coding area and resume video.
      setCurrentTaskIndex(null);
      if (playerReady && playerInstanceRef.current) {
        playerInstanceRef.current.playVideo();
      }
    }
  }, [currentTaskIndex, tasks, playerVideoId, playerReady]);

  // Check for upcoming tasks based on video time.
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

  // Auto-scroll playlist sidebar to the active task.
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
      {/* Left Column: Video and Coding Area */}
      <div className="left-column">
        <div className="video-progress-container">
          <div className={`video-container ${currentTaskIndex === null ? "" : "hidden"}`}>
            <div className="youtube-player" ref={playerRef} id="player"></div>
          </div>
          <div className="course-progress-bar">
            <div className="course-progress-bar-inner" style={{ width: videoProgress + "%" }}>
              <span className="progress-percent">{videoProgress}%</span>
            </div>
          </div>
        </div>
        {tasks.length > 0 && currentTaskIndex !== null && (
          <div className="code-task-container">
            <CodeTask task={tasks[currentTaskIndex]} onTaskComplete={handleTaskComplete} />
          </div>
        )}
      </div>
      {/* Right Column: Playlist Sidebar */}
      <div className="playlist-sidebar">
        <h3>Playlist</h3>
        <ul>
          {tasks.map((task) => {
            const isActive =
              currentTaskIndex !== null && tasks[currentTaskIndex].id === task.id;
            const isCompleted = completedTasks.includes(String(task.id));
            return (
              <li
                key={task.id}
                id={`playlist-item-${task.id}`}
                className={`playlist-item ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
                onClick={() => {
                  // If the task is completed and coding area is active, exit coding area
                  if (isCompleted && playerInstanceRef.current) {
                    const taskTimeSec = convertTimestampToSeconds(task.timestamp);
                    let targetTime = taskTimeSec - 30;
                    if (targetTime < 0) targetTime = 0;
                    playerInstanceRef.current.seekTo(targetTime, true);
                    if (currentTaskIndex !== null) {
                      setCurrentTaskIndex(null);
                      playerInstanceRef.current.playVideo();
                    }
                  }
                }}
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
