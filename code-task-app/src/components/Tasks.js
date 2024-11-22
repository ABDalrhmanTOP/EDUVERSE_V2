import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Tasks = ({ playlistId }) => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`/playlists/${playlistId}/tasks`);
                setTasks(response.data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchTasks();
    }, [playlistId]);

    return (
        <div>
            <h2>Tasks</h2>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <strong>{task.title}</strong>: {task.prompt}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Tasks;
