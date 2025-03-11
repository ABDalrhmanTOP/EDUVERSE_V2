import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeTask from "./CodeTask";
import axios from "../api/axios";
import "../App.css";
import { debounce } from "lodash";

// Utility Functions
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
    const [lastWatchedTimestamp, setLastWatchedTimestamp] = useState(null);
    const [playerVideoId, setPlayerVideoId] = useState(null);
    const playerRef = useRef(null);
    const playerInstanceRef = useRef(null);
    const taskTriggeredRef = useRef(false);

    // Debounced save progress function to prevent excessive API calls
    const debouncedSaveProgress = useCallback(debounce(async (seconds) => {
        try {
            const timestamp = convertSecondsToTimestamp(seconds);
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.post(
                "/user-progress",
                {
                    video_id: playerVideoId,
                    last_timestamp: timestamp,
                    playlist_id: playlistId,
                },
                { headers }
            );
            console.log("Progress saved:", timestamp);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error("Unauthorized: Redirecting to login.");
                window.location.href = "/login";
            } else {
                console.error("Error saving progress:", error);
            }
        }
    }, 10000), [playerVideoId, playlistId]); // 10-second debounce delay

    // Fetch tasks and user progress
    useEffect(() => {
        const fetchTasksAndProgress = async () => {
            try {
                console.log("Fetching tasks and user progress...");
                const token = localStorage.getItem("authToken");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const playlistResponse = await axios.get(`/playlists/${playlistId}`, { headers });
                const videoId = playlistResponse.data.video_id;

                const [tasksResponse, progressResponse] = await Promise.all([
                    axios.get(`/tasks/${playlistId}`, { headers }),
                    axios.get(`/user-progress`, {
                        params: { video_id: videoId },
                        headers,
                    }),
                ]);

                console.log("Tasks fetched:", tasksResponse.data);
                console.log("User progress fetched:", progressResponse.data);

                setTasks(tasksResponse.data || []);
                setCompletedTasks(progressResponse.data?.completed_tasks || []);
                setLastWatchedTimestamp(progressResponse.data?.last_timestamp || "00:00:00");
                setPlayerVideoId(videoId);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error("Unauthorized: Redirecting to login.");
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
                console.log("Loading YouTube iframe API script...");
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

            if (!playerRef.current) {
                console.warn("Player ref is not available.");
                return;
            }

            console.log("Initializing YouTube Player...");
            playerInstanceRef.current = new window.YT.Player(playerRef.current, {
                videoId: playerVideoId,
                events: {
                    onReady: (event) => {
                        console.log("YouTube Player is ready.");
                        setPlayerReady(true);
                        if (lastWatchedTimestamp && lastWatchedTimestamp !== "00:00:00") {
                            const lastTimestampInSeconds = convertTimestampToSeconds(lastWatchedTimestamp);
                            event.target.seekTo(lastTimestampInSeconds, true);
                            console.log("Seeking to last watched timestamp:", lastWatchedTimestamp);
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

    // Handle player state changes
    const handlePlayerStateChange = useCallback((event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            if (currentTaskIndex === null) {
                taskTriggeredRef.current = false;
            }
            if (currentTaskIndex !== null) {
                console.log("Pausing video for current task.");
                event.target.pauseVideo();
            }
        }
    }, [currentTaskIndex]);

    // Handle completion of a task
    const handleTaskComplete = useCallback(() => {
        if (currentTaskIndex !== null) {
            console.log("Task completed:", tasks[currentTaskIndex].id);
            setCompletedTasks((prev) => [...prev, tasks[currentTaskIndex].id]);
            setCurrentTaskIndex(null);
            if (playerReady && playerInstanceRef.current) {
                console.log("Resuming video after task completion.");
                playerInstanceRef.current.playVideo();
            }
        }
    }, [currentTaskIndex, tasks, playerReady]);

    // Check for tasks based on video progress
    useEffect(() => {
        if (!playerInstanceRef.current || !tasks.length || !playerReady) return;

        const interval = setInterval(() => {
            if (typeof playerInstanceRef.current.getCurrentTime !== "function") return;

            try {
                const currentTime = Math.floor(playerInstanceRef.current.getCurrentTime());

                if (taskTriggeredRef.current) return;

                const nextTaskIndex = tasks.findIndex(
                    (task) =>
                        currentTime >= convertTimestampToSeconds(task.timestamp) &&
                        !completedTasks.includes(task.id)
                );

                if (nextTaskIndex !== -1 && nextTaskIndex !== currentTaskIndex) {
                    console.log("Triggering task at timestamp:", tasks[nextTaskIndex].timestamp);
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
            if (playerInstanceRef.current && playerReady && typeof playerInstanceRef.current.getCurrentTime === "function") {
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

    return (
        <div className="youtube-layout-container">
            <div className={`youtube-player ${currentTaskIndex === null ? "" : "hidden"}`}>
                <div ref={playerRef} id="player"></div>
            </div>
            {tasks.length > 0 && currentTaskIndex !== null && (
                <div className="code-task-container">
                    <CodeTask task={tasks[currentTaskIndex]} onTaskComplete={handleTaskComplete} />
                </div>
            )}
            <div className="playlist-sidebar">
                <h3>Playlist</h3>
                <ul>
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className={`playlist-item ${completedTasks.includes(task.id) ? "active" : ""}`}
                        >
                            {task.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default YouTubeEmbed;
