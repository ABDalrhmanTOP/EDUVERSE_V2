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

const YouTubeEmbed = ({ videoId, playlistId, tasks = [], completedTasks: initialCompletedTasks = [], onTaskComplete, initialTimestamp = "00:00:00" }) => {
  const navigate = useNavigate();
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(initialCompletedTasks);
  const [lastWatchedTimestamp, setLastWatchedTimestamp] = useState(initialTimestamp);
  const [maxTimeReached, setMaxTimeReached] = useState(convertTimestampToSeconds(initialTimestamp));
  const [videoProgress, setVideoProgress] = useState(0);
  const [playerVideoId, setPlayerVideoId] = useState(videoId);
  const [hasFinalTest, setHasFinalTest] = useState(false);
  const [finalTestData, setFinalTestData] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const taskTriggeredRef = useRef(false);

  // Debounced saving (3s delay)
  const debouncedSaveProgress = useCallback(
    debounce(async (seconds) => {
      try {
        const timestamp = convertSecondsToTimestamp(seconds);
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (!token) return;
        
        const headers = { Authorization: `Bearer ${token}` };
        console.log('Saving progress:', { timestamp, playlistId, videoId: playerVideoId });
        
        await axios.post(
          "/user-progress",
          {
            video_id: String(playerVideoId),
            last_timestamp: timestamp,
            playlist_id: playlistId,
          },
          { headers }
        );
        console.log('Progress saved successfully');
      } catch (error) {
        console.error("Failed to save progress:", error);
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
      }
    }, 3000),
    [playerVideoId, playlistId]
  );

  // Flush debounced calls on page unload and unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debouncedSaveProgress.flush) {
        debouncedSaveProgress.flush();
      }
      // Save the latest progress synchronously
      debouncedSaveProgress(maxTimeReached);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (debouncedSaveProgress.flush) {
        debouncedSaveProgress.flush();
      }
      debouncedSaveProgress(maxTimeReached);
    };
  }, [debouncedSaveProgress, maxTimeReached]);

  // Set video ID when prop changes
  useEffect(() => {
    setPlayerVideoId(videoId);
  }, [videoId]);

  // Update lastWatchedTimestamp when initialTimestamp changes
  useEffect(() => {
    setLastWatchedTimestamp(initialTimestamp);
    setMaxTimeReached(convertTimestampToSeconds(initialTimestamp));
  }, [initialTimestamp]);

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
            // Get video duration
            const duration = event.target.getDuration();
            setVideoDuration(duration);
            if (lastWatchedTimestamp && lastWatchedTimestamp !== "00:00:00") {
              const seekTime = convertTimestampToSeconds(lastWatchedTimestamp);
              event.target.seekTo(seekTime, true);
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
          if (videoDuration > 0) {
            setVideoProgress(Math.round((newMax * 100) / videoDuration));
          }
          return newMax;
        });
      }
    }, 1000);
    return () => clearInterval(progressInterval);
  }, [playerReady, videoDuration]);

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
      console.log('Completing task:', currentTask.id, 'Title:', currentTask.title);
      
      if (onTaskComplete) {
        onTaskComplete(currentTask.id);
      }
      setCompletedTasks((prev) => {
        const taskIdStr = String(currentTask.id);
        if (!prev.includes(taskIdStr)) {
          console.log('Task completed, updating completed tasks:', [...prev, taskIdStr]);
          return [...prev, taskIdStr];
        }
        return prev;
      });
      setCurrentTaskIndex(null);
      if (playerReady && playerInstanceRef.current) {
        playerInstanceRef.current.playVideo();
      }
    }
  }, [currentTaskIndex, tasks, playerReady, onTaskComplete]);

  // Check if course has a final project
  const checkForFinalProject = async () => {
    try {
      const response = await axios.get(`/final-projects/check/${playlistId}`);
      if (response.data.status === 'success' && response.data.has_final_project) {
        setHasFinalTest(true);
        setFinalTestData(response.data.project);
      }
    } catch (error) {
      console.error("Failed to check for final project:", error);
    }
  };

  // When video is finished, show button to navigate to Final Project
  const handleGoToFinalProject = () => {
    navigate(`/final-project?courseId=${playlistId}`);
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

  // Update completed tasks when prop changes
  useEffect(() => {
    setCompletedTasks(initialCompletedTasks);
  }, [initialCompletedTasks]);

  // Check for next task every second
  useEffect(() => {
    if (!playerInstanceRef.current || !tasks.length || !playerReady) return;
    const interval = setInterval(() => {
      try {
        const currentTime = Math.floor(playerInstanceRef.current.getCurrentTime());
        if (taskTriggeredRef.current) return;
        
        // Find the next uncompleted task
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
        console.error("Error checking for tasks:", error);
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

  const progressPercent = videoDuration > 0 ? Math.round((maxTimeReached * 100) / videoDuration) : 0;
  
  // Check if all tasks are completed
  const allTasksCompleted = tasks.length > 0 && completedTasks.length === tasks.length;
  
  // Show final project button when video progress is >= 99%
  const showFinalProjectButton = progressPercent >= 99;
  
  console.log('Progress debug:', {
    tasksLength: tasks.length,
    completedTasksLength: completedTasks.length,
    allTasksCompleted,
    hasFinalTest,
    progressPercent
  });

  // Check for final project when component mounts
  useEffect(() => {
    if (playlistId) {
      checkForFinalProject();
    }
  }, [playlistId]);

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
          {showFinalProjectButton && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={handleGoToFinalProject} className="submit-final-button">
                {hasFinalTest ? "Go to Final Project" : "Go to Final Project"}
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
                  if (playerInstanceRef.current) {
                    const sec = convertTimestampToSeconds(t.timestamp);
                    let targetTime = sec - 30;
                    if (targetTime < 0) targetTime = 0;
                    playerInstanceRef.current.seekTo(targetTime, true);
                    
                    // Find the task index and show it
                    const taskIndex = tasks.findIndex(task => task.id === t.id);
                    if (taskIndex !== -1) {
                      setCurrentTaskIndex(taskIndex);
                      playerInstanceRef.current.pauseVideo();
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
