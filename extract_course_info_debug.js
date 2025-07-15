// Debug Extract Course Info Node - Let's see what data we're actually getting
const inputData = $input.first().json;

console.log('=== N8N EXTRACT COURSE INFO DEBUG ===');
console.log('Raw input data received:', JSON.stringify(inputData, null, 2));
console.log('Input data type:', typeof inputData);
console.log('Input data keys:', Object.keys(inputData));

// Check if data is nested in body
if (inputData.body) {
  console.log('Data found in body property:', JSON.stringify(inputData.body, null, 2));
  console.log('Body keys:', Object.keys(inputData.body));
}

// Check if data is nested in query
if (inputData.query) {
  console.log('Data found in query property:', JSON.stringify(inputData.query, null, 2));
  console.log('Query keys:', Object.keys(inputData.query));
}

// Check if data is nested in params
if (inputData.params) {
  console.log('Data found in params property:', JSON.stringify(inputData.params, null, 2));
  console.log('Params keys:', Object.keys(inputData.params));
}

// Let's try to find the actual data
let courseData = null;

// Try different possible locations
if (inputData.body && inputData.body.videoId) {
  courseData = inputData.body;
  console.log('Found data in inputData.body');
} else if (inputData.videoId) {
  courseData = inputData;
  console.log('Found data in inputData root');
} else if (inputData.query && inputData.query.videoId) {
  courseData = inputData.query;
  console.log('Found data in inputData.query');
} else {
  console.log('Could not find videoId in any expected location');
  console.log('Available data locations:');
  console.log('- inputData.body:', !!inputData.body);
  console.log('- inputData.query:', !!inputData.query);
  console.log('- inputData.params:', !!inputData.params);
  console.log('- inputData root keys:', Object.keys(inputData));
}

if (courseData) {
  console.log('Extracted course data:', JSON.stringify(courseData, null, 2));
  console.log('Course data keys:', Object.keys(courseData));
  
  // Check for required fields
  console.log('videoId present:', !!courseData.videoId);
  console.log('captions present:', !!courseData.captions);
  console.log('title present:', !!courseData.title);
  console.log('duration present:', !!courseData.duration);
  
  if (courseData.videoId && courseData.captions) {
    console.log('✅ All required fields found!');
    
    // Process the data
    const videoId = courseData.videoId;
    const durationSeconds = parseInt(courseData.duration) || 0;
    const durationMinutes = Math.round(durationSeconds / 60);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const result = {
      courseData: {
        video_id: videoId,
        name: courseData.title || 'Course from YouTube Video',
        description: courseData.captions ? courseData.captions.substring(0, 500) + '...' : 'Educational course extracted from YouTube video content',
        video_duration: courseData.duration,
        year: 1,
        semester: 1,
        paid: false,
        youtube_url: youtubeUrl,
        video_metadata: {
          title: courseData.title,
          description: courseData.captions ? courseData.captions.substring(0, 1000) : '',
          channel_title: 'YouTube Channel',
          published_at: new Date().toISOString(),
          captions: courseData.captions,
          duration: courseData.duration
        }
      },
      durationMinutes,
      videoUrl: youtubeUrl,
      requestId: courseData.videoId,
      youtube_url: youtubeUrl,
      timestamp: courseData.duration,
      youtube_url_for_ai: youtubeUrl,
      timestamp_for_ai: courseData.duration,
      video_title: courseData.title,
      video_description: courseData.captions ? courseData.captions.substring(0, 1000) : '',
      video_channel: 'YouTube Channel',
      video_published: new Date().toISOString(),
      video_captions: courseData.captions,
      video_duration: courseData.duration,
      ai_context: {
        video_title: courseData.title,
        video_description: courseData.captions ? courseData.captions.substring(0, 1000) : '',
        video_channel: 'YouTube Channel',
        video_captions: courseData.captions,
        video_duration: courseData.duration,
        video_url: youtubeUrl
      }
    };
    
    console.log('=== SUCCESS - RETURNING RESULT ===');
    return result;
  } else {
    console.log('❌ Missing required fields');
    console.log('videoId:', courseData.videoId);
    console.log('captions:', courseData.captions ? 'Present' : 'Missing');
    throw new Error(`Missing required course information: videoId and captions are required. Found videoId: ${!!courseData.videoId}, captions: ${!!courseData.captions}`);
  }
} else {
  throw new Error('Could not locate course data in webhook payload. Please check the data structure.');
} 