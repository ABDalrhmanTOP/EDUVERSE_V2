import React, { useState, useEffect, useRef, useCallback } from "react";
import CodeTask from "./CodeTask";
import axios from "../api/axios";

// Helper: Convert timestamps (e.g., "01:43:00") to seconds
const convertTimestampToSeconds = (timestamp) => {
    const [hours, minutes, seconds] = timestamp.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
};

const YouTubeEmbed = ({ videoId, playlistId }) => {
    const [tasks, setTasks] = useState([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
    const [isTaskActive, setIsTaskActive] = useState(false);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [lastWatchedTimestamp, setLastWatchedTimestamp] = useState(0);
    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);

    // Fetch tasks and progress
    useEffect(() => {
        const fetchData = async () => {
            try {
                const tasksRes = await axios.get(`/tasks/${playlistId}`);
                const progressRes = await axios.get(`/user-progress?video_id=${videoId}`);

                setTasks(tasksRes.data || []);
                setCompletedTasks(progressRes.data?.completed_tasks || []);

                // Convert saved timestamp from hh:mm:ss to seconds
                const savedTimestamp = progressRes.data?.last_timestamp;
                const [hours, minutes, seconds] = savedTimestamp.split(":").map(Number);
                const lastWatchedInSeconds = hours * 3600 + minutes * 60 + seconds;
                setLastWatchedTimestamp(lastWatchedInSeconds);

                console.log("Fetched Tasks:", tasksRes.data);
                console.log("Fetched Progress:", progressRes.data);
            } 
            catch (error) {
                console.error("Error fetching tasks or progress:", error);
            }
};


        fetchData();
    }, [playlistId, videoId]);

    // Save progress
    const saveProgress = useCallback(
        async (timestamp) => {
            try {
                await axios.post("/user-progress", {
                    video_id: videoId,
                    last_timestamp: timestamp,
                });
                setLastWatchedTimestamp(timestamp);
                console.log("Progress saved:", timestamp);
            } catch (error) {
                console.error("Error saving progress:", error);
            }
        },
        [videoId]
    );
    
    // Mark task as completed
    const markTaskAsCompleted = useCallback(async (taskId) => {
        try {
            const response = await axios.post("/user-progress/tasks", { task_id: taskId });
            console.log("Task Completion Response:", response.data); // Debugging
            setCompletedTasks((prev) => [...prev, taskId]);
        } catch (error) {
            console.error("Error marking task as completed:", error);
        }
    }, []);

    // Save progress every second
    useEffect(() => {
        const interval = setInterval(() => {
            if (player && !isTaskActive && typeof player.getCurrentTime === "function") {
                const currentTime = Math.floor(player.getCurrentTime());
                saveProgress(currentTime);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player, isTaskActive, saveProgress]);

    // Prevent skipping over unsolved tasks
    useEffect(() => {
        const preventSkipping = () => {
            if (player && isTaskActive) {
                const taskTimestamp = convertTimestampToSeconds(tasks[currentTaskIndex]?.timestamp || 0);
                player.seekTo(taskTimestamp, true);
                console.log("Preventing skip to task timestamp:", taskTimestamp);
            }
        };

        const interval = setInterval(preventSkipping, 500);
        return () => clearInterval(interval);
    }, [player, isTaskActive, tasks, currentTaskIndex]);

    // Check if tasks should appear
    useEffect(() => {
        const interval = setInterval(() => {
            if (player && typeof player.getCurrentTime === "function" && !isTaskActive) {
                const currentTime = Math.floor(player.getCurrentTime());
                const taskIndex = tasks.findIndex(
                    (task) =>
                        Math.abs(currentTime - convertTimestampToSeconds(task.timestamp)) <= 1 &&
                        !completedTasks.includes(task.id)
                );

                if (taskIndex !== -1) {
                    setCurrentTaskIndex(taskIndex);
                    setIsTaskActive(true);
                    player.pauseVideo();
                    console.log("Task activated:", tasks[taskIndex]);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player, tasks, completedTasks, isTaskActive]);

    const handleTaskComplete = async () => {
        const currentTask = tasks[currentTaskIndex];
        if (currentTask) {
            await markTaskAsCompleted(currentTask.id);
        }
    
        setIsTaskActive(false);
        setCurrentTaskIndex(null);
    
        if (player) {
            const taskTimestamp = convertTimestampToSeconds(currentTask?.timestamp || "00:00:00");
            player.seekTo(taskTimestamp + 1, true);
            player.playVideo();
            console.log("Resuming video from:", taskTimestamp + 1);
        }
    };
    

    // Initialize YouTube Player API
    useEffect(() => {
        const loadYouTubeAPI = () => {
            if (!window.YT) {
                const script = document.createElement("script");
                script.src = "https://www.youtube.com/iframe_api";
                script.async = true;
                document.body.appendChild(script);
            }
        };

        loadYouTubeAPI();

        window.onYouTubeIframeAPIReady = () => {
            const newPlayer = new window.YT.Player(playerRef.current, {
                videoId,
                events: {
                    onReady: (event) => {
                        console.log("YouTube Player Initialized");
                        setPlayer(event.target);
                        if (lastWatchedTimestamp > 0) {
                            event.target.seekTo(lastWatchedTimestamp, true);
                        }
                    },
                },
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                },
            });
            setPlayer(newPlayer);
        };
    }, [videoId, lastWatchedTimestamp]);

    return (
        <div className="youtube-layout-container">
            {isTaskActive ? (
                <CodeTask task={tasks[currentTaskIndex]} onTaskComplete={handleTaskComplete} />
            ) : (
                <div className="youtube-player">
                    <div ref={playerRef} id="player"></div>
                </div>
            )}
        </div>
    );
};

export default YouTubeEmbed;
