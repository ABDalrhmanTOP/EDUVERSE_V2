import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Recommendations = ({ userId }) => {
  const [recs, setRecs] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    axios.get(`/recommendations/${userId}`)
      .then(res => {
        setRecs(res.data.recommendations || []);
        setCourseDetails(res.data.course_details || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recommendations:', err);
        setError(err.response?.data?.message || 'Failed to load recommendations');
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="recommendations-container">
        <h3>Recommended Courses for You:</h3>
        <div className="loading">Loading recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <h3>Recommended Courses for You:</h3>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <h3>Recommended Courses for You:</h3>
      {recs.length === 0 ? (
        <div className="no-recommendations">
          <p>No recommendations found. Try completing more courses to get personalized recommendations!</p>
        </div>
      ) : (
        <div className="recommendations-list">
          {courseDetails.map(course => (
            <div key={course.id} className="recommendation-item">
              <h4>{course.name}</h4>
              {course.description && (
                <p className="course-description">{course.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations; 