// src/components/YouTubeEmbed.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeTask from "./CodeTask";
import axios from "../api/axios";
import "../App.css";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";  // Updated import

// Helper conversions
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

const convertSecondsToTimestamp = (seconds) => {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

const YouTubeEmbed = ({ playlistId }) => {
  const navigate = useNavigate(); // useNavigate replaces useHistory
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [lastWatchedTimestamp, setLastWatchedTimestamp] = useState("00:00:00");
  const [maxTimeReached, setMaxTimeReached] = useState(0);
  const [playerVideoId, setPlayerVideoId] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);

  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const taskTriggeredRef = useRef(false);

  // Debounced saving (3s delay)
  const debouncedSaveProgress = useCallback(
    debounce(async (seconds) => {
      try {
        const timestamp = convertSecondsToTimestamp(seconds);
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
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
      }
    }, 3000),
    [playerVideoId, playlistId]
  );

  // Flush debounced calls on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debouncedSaveProgress.flush) {
        debouncedSaveProgress.flush();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [debouncedSaveProgress]);

  // Fetch Progress
  const fetchProgress = async (videoId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("/user-progress", {
        params: {
          video_id: String(videoId),
          playlist_id: playlistId,
        },
        headers,
      });
      if (response.data && response.data.data) {
        const data = response.data.data;
        setCompletedTasks(data.completed_tasks || []);
        setLastWatchedTimestamp(data.last_timestamp || "00:00:00");
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  // Fetch tasks & progress on mount
  useEffect(() => {
    const fetchTasksAndProgress = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Get playlist info => videoId
        const playlistResponse = await axios.get(`/playlists/${playlistId}`, { headers });
        const videoId = String(playlistResponse.data.video_id);

        // Get tasks & progress in parallel
        const [tasksResponse, progressResponse] = await Promise.all([
          axios.get(`/tasks/${playlistId}`, { headers }),
          axios.get("/user-progress", {
            params: { video_id: videoId, playlist_id: playlistId },
            headers,
          }),
        ]);

        const tasksData = tasksResponse.data || [];
        tasksData.sort(
          (a, b) =>
            convertTimestampToSeconds(a.timestamp) - convertTimestampToSeconds(b.timestamp)
        );
        setTasks(tasksData);

        if (progressResponse.data && progressResponse.data.data) {
          const p = progressResponse.data.data;
          setCompletedTasks(p.completed_tasks || []);
          setLastWatchedTimestamp(p.last_timestamp || "00:00:00");
        } else {
          setCompletedTasks([]);
          setLastWatchedTimestamp("00:00:00");
        }

        setPlayerVideoId(videoId);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
      }
    };

    fetchTasksAndProgress();
  }, [playlistId]);

  // Initialize YouTube Player
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
              event.target.seekTo(convertTimestampToSeconds(lastWatchedTimestamp), true);
            }
          },
          onStateChange: handlePlayerStateChange,
        },
        playerVars: {
          autoplay: 0,
          controls: 1,
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
        },
      });
    };

    loadYouTubeAPI();
  }, [lastWatchedTimestamp, playerVideoId]);

  // Track Video Progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (
        playerInstanceRef.current &&
        playerReady &&
        typeof playerInstanceRef.current.getCurrentTime === "function"
      ) {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        setMaxTimeReached((prev) => {
          const newMax = currentTime > prev ? currentTime : prev;
          const VIDEO_DURATION = 112049;
          setVideoProgress(Math.round((newMax * 100) / VIDEO_DURATION));
          return newMax;
        });
      }
    }, 1000);
    return () => clearInterval(progressInterval);
  }, [playerReady]);

  // Debounced save progress every 5 seconds
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

  // Pause video if task is open
  useEffect(() => {
    if (currentTaskIndex !== null && playerInstanceRef.current) {
      playerInstanceRef.current.pauseVideo();
    }
  }, [currentTaskIndex]);

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

  // Mark task complete
  const handleTaskComplete = useCallback(async () => {
    if (currentTaskIndex !== null) {
      const currentTask = tasks[currentTaskIndex];
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.post(
          "/user-progress/tasks",
          {
            video_id: String(playerVideoId),
            playlist_id: playlistId,
            task_id: String(currentTask.id),
          },
          { headers }
        );
        if (res.data && res.data.data) {
          setCompletedTasks(res.data.data.completed_tasks || []);
        } else {
          setCompletedTasks((prev) => [...prev, String(currentTask.id)]);
        }
        await fetchProgress(playerVideoId);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
      }
      setCurrentTaskIndex(null);
      if (playerReady && playerInstanceRef.current) {
        playerInstanceRef.current.playVideo();
      }
    }
  }, [currentTaskIndex, tasks, playerVideoId, playlistId, playerReady]);

  // When video is finished, show button to navigate to Final Project
  const handleGoToFinalProject = () => {
    // Navigate using useNavigate hook
    navigate("/final-project");
  };

  // Return to course button for tasks
  const handleReturn = () => {
    if (currentTaskIndex !== null && tasks.length > 0 && playerInstanceRef.current) {
      const taskTimeSec = convertTimestampToSeconds(tasks[currentTaskIndex].timestamp);
      let targetTime = taskTimeSec - 30;
      if (targetTime < 0) targetTime = 0;
      playerInstanceRef.current.seekTo(targetTime, true);
      setCurrentTaskIndex(null);
      playerInstanceRef.current.playVideo();
    }
  };

  // Check for next task every second
  useEffect(() => {
    if (!playerInstanceRef.current || !tasks.length || !playerReady) return;
    const interval = setInterval(() => {
      try {
        const currentTime = Math.floor(playerInstanceRef.current.getCurrentTime());
        if (taskTriggeredRef.current) return;
        const nextTaskIndex = tasks.findIndex(
          (t) =>
            currentTime >= convertTimestampToSeconds(t.timestamp) &&
            !completedTasks.includes(String(t.id))
        );
        if (nextTaskIndex !== -1 && nextTaskIndex !== currentTaskIndex) {
          setCurrentTaskIndex(nextTaskIndex);
          playerInstanceRef.current.pauseVideo();
          taskTriggeredRef.current = true;
        }
      } catch (error) {
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks, completedTasks, currentTaskIndex, playerReady]);

  // Scroll active task into view in sidebar
  useEffect(() => {
    if (currentTaskIndex !== null && tasks.length > 0) {
      const activeTaskId = tasks[currentTaskIndex].id;
      const element = document.getElementById(`playlist-item-${activeTaskId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTaskIndex, tasks]);

  const VIDEO_DURATION = 112049;
  const progressPercent = Math.round((maxTimeReached * 100) / VIDEO_DURATION);

  return (
    <div className="youtube-layout-container">
      <div className="left-column">
        <div className="video-progress-container">
          <div className={`video-container ${currentTaskIndex === null ? "" : "hidden"}`}>
            <div className="youtube-player" ref={playerRef} id="player" />
          </div>
          <div className="course-progress-bar">
            <div className="course-progress-bar-inner" style={{ width: progressPercent + "%" }}>
              <span className="progress-percent">{progressPercent}%</span>
            </div>
          </div>
          {progressPercent >= 100 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={handleGoToFinalProject} className="submit-final-button">
                Go to Final Project
              </button>
            </div>
          )}
        </div>
        {tasks.length > 0 && currentTaskIndex !== null && (
          <div className="code-task-container">
            <CodeTask
              task={tasks[currentTaskIndex]}
              onTaskComplete={handleTaskComplete}
              onReturn={handleReturn}
            />
          </div>
        )}
      </div>
      <div className="playlist-sidebar">
        <h3>Playlist</h3>
        <ul>
          {tasks.map((t) => {
            const active = currentTaskIndex !== null && tasks[currentTaskIndex].id === t.id;
            const completed = completedTasks.includes(String(t.id));
            return (
              <li
                key={t.id}
                id={`playlist-item-${t.id}`}
                className={`playlist-item ${active ? "active" : ""} ${completed ? "completed" : ""}`}
                onClick={() => {
                  if (completed && playerInstanceRef.current) {
                    const sec = convertTimestampToSeconds(t.timestamp);
                    let targetTime = sec - 30;
                    if (targetTime < 0) targetTime = 0;
                    playerInstanceRef.current.seekTo(targetTime, true);
                    if (currentTaskIndex !== null) {
                      setCurrentTaskIndex(null);
                      playerInstanceRef.current.playVideo();
                    }
                  }
                }}
              >
                {t.title}
                {completed && <span className="checkmark"> ✔️</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default YouTubeEmbed;
