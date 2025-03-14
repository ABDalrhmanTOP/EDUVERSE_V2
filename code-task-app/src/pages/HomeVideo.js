import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get("/courses");
        setPlaylists(response.data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
        setError("فشل تحميل الدورات، يرجى المحاولة لاحقًا.");
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        الدورات المتاحة
      </h2>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* جعل العرض أفقيًا مع التمرير */}
      <div className="flex gap-8 overflow-x-auto p-4 scrollbar-hide">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
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
      className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-2xl transition duration-300 min-w-[280px]"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <img
          src={playlist.thumbnail || `https://img.youtube.com/vi/${playlist.video_id}/hqdefault.jpg`}
          alt={playlist.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          {playlist.name}
        </h3>
        <p className="text-gray-500">{playlist.description}</p>
        <button
          onClick={handleCourses}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
        >
         Watch the course
        </button>
      </div>
    </motion.div>
  );
};

export default Playlists;
