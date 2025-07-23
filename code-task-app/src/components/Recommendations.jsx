import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Recommendations = ({ userId }) => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/recommendations/${userId}`)
      .then(res => {
        setRecs(res.data.recommendations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <div>
      <h3>Recommended Courses for You:</h3>
      {loading ? <p>Loading...</p> : (
        <ul>
          {recs.length === 0 ? <li>No recommendations found.</li> :
            recs.map(courseId => <li key={courseId}>{courseId}</li>)}
        </ul>
      )}
    </div>
  );
};

export default Recommendations; 