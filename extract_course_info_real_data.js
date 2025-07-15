// Fixed Extract Course Info Node - Matches Real Frontend Data Structure
const inputData = $input.first().json;

console.log('=== N8N EXTRACT COURSE INFO DEBUG ===');
console.log('Raw input data received:', JSON.stringify(inputData, null, 2));

// Handle real webhook data structure - data is in body
let courseData = inputData.body;

console.log('Extracted course data from body:', JSON.stringify(courseData, null, 2));

// Validate required fields based on real frontend structure
if (!courseData.youtube_url || !courseData.video_captions) {
  throw new Error('Missing required course information: youtube_url and video_captions are required');
}

// Extract video ID from YouTube URL
const youtubeUrl = courseData.youtube_url;
let videoId = null;

if (youtubeUrl.includes('youtube.com/watch?v=')) {
  videoId = youtubeUrl.split('v=')[1].split('&')[0];
} else if (youtubeUrl.includes('youtu.be/')) {
  videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
} else if (youtubeUrl.includes('youtube.com/embed/')) {
  videoId = youtubeUrl.split('embed/')[1].split('?')[0];
}

if (!videoId) {
  throw new Error('Could not extract video ID from YouTube URL');
}

console.log('Extracted video ID:', videoId);

// Parse timestamp to get duration in seconds
const timestampParts = courseData.timestamp.split(':');
const durationSeconds = parseInt(timestampParts[0]) * 3600 + parseInt(timestampParts[1]) * 60 + parseInt(timestampParts[2]);
const durationMinutes = Math.round(durationSeconds / 60);

// Log video metadata for debugging
console.log('Video metadata found:', {
  has_title: !!courseData.video_title,
  has_description: !!courseData.video_description,
  has_channel: !!courseData.video_channel,
  has_captions: !!courseData.video_captions,
  has_duration: !!courseData.video_duration,
  captions_length: courseData.video_captions ? courseData.video_captions.length : 0,
  captions_preview: courseData.video_captions ? courseData.video_captions.substring(0, 200) + '...' : 'None',
  course_duration: courseData.video_duration,
  timestamp: courseData.timestamp,
  duration_seconds: durationSeconds
});

// Prepare enhanced course data with fetched video information including captions
const preparedCourseData = {
  video_id: videoId,
  name: courseData.video_title || 'Course from YouTube Video',
  description: courseData.video_captions ? courseData.video_captions.substring(0, 500) + '...' : 'Educational course extracted from YouTube video content',
  video_duration: courseData.video_duration,
  year: 1,
  semester: 1,
  paid: false,
  youtube_url: youtubeUrl,
  video_metadata: {
    title: courseData.video_title,
    description: courseData.video_description,
    channel_title: courseData.video_channel,
    published_at: courseData.video_published,
    captions: courseData.video_captions,
    duration: courseData.video_duration
  }
};

// Return the data for AI with captions and duration
const result = {
  courseData: preparedCourseData,
  durationMinutes,
  videoUrl: youtubeUrl,
  requestId: courseData.request_id,
  youtube_url: youtubeUrl,
  timestamp: courseData.timestamp,
  youtube_url_for_ai: youtubeUrl,
  timestamp_for_ai: courseData.timestamp,
  video_title: courseData.video_title,
  video_description: courseData.video_description,
  video_channel: courseData.video_channel,
  video_published: courseData.video_published,
  video_captions: courseData.video_captions,
  video_duration: courseData.video_duration, // CRITICAL: For timestamp validation
  ai_context: {
    video_title: courseData.video_title,
    video_description: courseData.video_description,
    video_channel: courseData.video_channel,
    video_captions: courseData.video_captions,
    video_duration: courseData.video_duration,
    video_url: youtubeUrl
  }
};

console.log('=== FINAL RESULT FOR AI ===');
console.log('Returning result with captions and duration:', {
  has_captions: !!result.video_captions,
  captions_length: result.video_captions ? result.video_captions.length : 0,
  captions_preview: result.video_captions ? result.video_captions.substring(0, 300) + '...' : 'None',
  course_duration: result.video_duration,
  ai_context_has_captions: !!result.ai_context.video_captions,
  video_title: result.video_title
});

return result; 