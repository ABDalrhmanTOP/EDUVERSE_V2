import React from "react";
import YouTubeEmbed from "../components/YouTubeEmbed";
import "../App.css";
const VideoPage = () => {
    const videoId = "8jLOx1hD3_o";
    const playlistId = 1; 

    return (
        <div className="vi">
            <p>

            </p>
            <YouTubeEmbed videoId={videoId} playlistId={playlistId} />
        </div>
    );
};

export default VideoPage;
