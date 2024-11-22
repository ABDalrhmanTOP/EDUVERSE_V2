import React from "react";
import YouTubeEmbed from "../components/YouTubeEmbed";

const VideoPage = () => {
    const videoId = "8jLOx1hD3_o";
    const playlistId = 1; 

    return (
        <div>
            <h1>Video Page</h1>
            <YouTubeEmbed videoId={videoId} playlistId={playlistId} />
        </div>
    );
};

export default VideoPage;
