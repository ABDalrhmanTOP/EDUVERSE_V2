import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get("/courses");
        setPlaylists(response.data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setError("Failed to load courses, please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Available Courses
      </h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center h-72">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <Slider {...settings} className="w-full max-w-screen-lg mx-auto">
          {playlists.length > 0 ? (
            playlists.map((playlist) => (
              <div key={playlist.id} className="px-2">
                <PlaylistCard playlist={playlist} />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">
              No courses available at the moment.
            </p>
          )}
        </Slider>
      )}
    </div>
  );
};

const PlaylistCard = ({ playlist }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCourses = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/foem_test");
    }
  };

  return (

        <motion.div
          className="relative group cursor-pointer"
          whileHover={{ scale: 1.05 }} // تكبير البطاقة عند التمرير
          onClick={handleCourses}
        >
          <img
            src={
              playlist.thumbnail ||
              `https://img.youtube.com/vi/${playlist.video_id}/hqdefault.jpg`
            }
            alt={playlist.name}
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 z-10 bg-black bg-opacity-60 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6">
            <h3 className="text-white text-2xl font-bold mb-3 text-center">
              {playlist.name}
            </h3>
            <p className="text-white text-md mb-4 text-center max-w-md">
              {playlist.description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCourses();
              }}
              className="bg-blue-600 text-white py-3 px-6 rounded-full shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Watch the Course
            </button>
          </div>
        </motion.div>
 
    
  );
};

export default Playlists;
