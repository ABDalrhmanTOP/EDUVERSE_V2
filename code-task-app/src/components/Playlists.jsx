import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/Playlist.css";

const Playlists = ({ currentTaskIndex, tasks }) => {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await axios.get("/playlists");
                setPlaylists(response.data);
            } catch (error) {
                // Remove all console.log, console.warn, and console.error statements from here
            }
        };
        fetchPlaylists();
    }, []);

    return (
        <div className="playlist-sidebar">
            <h1>Playlists</h1>
            <ul>
                {playlists.map((playlist) => (
                    <li key={playlist.id} className="playlist-item">
                        <span>{playlist.name}</span>
                        <ul>
                            {tasks &&
                                tasks.map((task, index) => (
                                    <li
                                        key={task.id}
                                        className={`playlist-task-item ${
                                            currentTaskIndex === index
                                                ? "active"
                                                : task.status === "success"
                                                ? "completed-success"
                                                : task.status === "error"
                                                ? "completed-error"
                                                : ""
                                        }`}
                                    >
                                        {task.title}
                                        {task.status === "success" && (
                                            <span className="task-status">✔️</span>
                                        )}
                                        {task.status === "error" && (
                                            <span className="task-status">❌</span>
                                        )}
                                    </li>
                                ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Playlists;
