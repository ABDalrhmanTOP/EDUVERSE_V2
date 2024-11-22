import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import YouTube from "react-youtube";

const VideoPlayer = forwardRef(({ videoId, onVideoReady, lastPlaybackTime }, ref) => {
    const playerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        playVideo: () => {
            if (playerRef.current) {
                playerRef.current.playVideo();
            }
        },
        pauseVideo: () => {
            if (playerRef.current) {
                playerRef.current.pauseVideo();
            }
        },
        seekTo: (time) => {
            if (playerRef.current) {
                playerRef.current.seekTo(time, true);
            }
        },
        getCurrentTime: () => {
            if (playerRef.current) {
                return playerRef.current.getCurrentTime();
            }
            return 0;
        },
    }));

    const handleReady = (event) => {
        playerRef.current = event.target;
        if (lastPlaybackTime > 0) {
            playerRef.current.seekTo(lastPlaybackTime, true);
        }
        if (onVideoReady) {
            onVideoReady(event);
        }
    };

    return (
        <YouTube
            videoId={videoId}
            opts={{
                playerVars: { autoplay: 0, controls: 1 },
            }}
            onReady={handleReady}
        />
    );
});

export default VideoPlayer;
