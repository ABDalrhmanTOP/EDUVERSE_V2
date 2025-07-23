// Fixed Extract Course Info Node - Matches Webhook Data Structure
const inputData = $input.first().json;

console.log('=== N8N EXTRACT COURSE INFO DEBUG ===');
console.log('Raw input data received:', JSON.stringify(inputData, null, 2));

// Handle webhook data structure - the data is directly in the body
let courseData = inputData;

console.log('Extracted course data:', JSON.stringify(courseData, null, 2));

// Validate required fields based on actual webhook structure
if (!courseData.videoId || !courseData.captions) {
  throw new Error('Missing required course information: videoId and captions are required');
}

// Extract video ID (already provided by webhook)
const videoId = courseData.videoId;

console.log('Using video ID:', videoId);

// Parse duration from seconds to minutes
const durationSeconds = parseInt(courseData.duration) || 0;
const durationMinutes = Math.round(durationSeconds / 60);

// Create YouTube URL from video ID
const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

// Log video metadata for debugging
console.log('Video metadata found:', {
  has_title: !!courseData.title,
  has_captions: !!courseData.captions,
  has_duration: !!courseData.duration,
  captions_length: courseData.captions ? courseData.captions.length : 0,
  captions_preview: courseData.captions ? courseData.captions.substring(0, 200) + '...' : 'None',
  duration_seconds: courseData.duration,
  duration_minutes: durationMinutes
});

// Prepare enhanced course data with fetched video information including captions
const preparedCourseData = {
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
};

// Return the data for AI with captions and duration
const result = {
  courseData: preparedCourseData,
  durationMinutes,
  videoUrl: youtubeUrl,
  requestId: courseData.videoId, // Use videoId as request ID
  youtube_url: youtubeUrl,
  timestamp: courseData.duration, // Use duration as timestamp
  youtube_url_for_ai: youtubeUrl,
  timestamp_for_ai: courseData.duration,
  video_title: courseData.title,
  video_description: courseData.captions ? courseData.captions.substring(0, 1000) : '',
  video_channel: 'YouTube Channel',
  video_published: new Date().toISOString(),
  video_captions: courseData.captions,
  video_duration: courseData.duration, // CRITICAL: For timestamp validation
  ai_context: {
    video_title: courseData.title,
    video_description: courseData.captions ? courseData.captions.substring(0, 1000) : '',
    video_channel: 'YouTube Channel',
    video_captions: courseData.captions,
    video_duration: courseData.duration,
    video_url: youtubeUrl
  }
};

console.log('=== FINAL RESULT FOR AI ===');
console.log('Returning result with captions and duration:', {
  has_captions: !!result.video_captions,
  captions_length: result.video_captions ? result.video_captions.length : 0,
  captions_preview: result.video_captions ? result.video_captions.substring(0, 300) + '...' : 'None',
  course_duration: result.video_duration,
  ai_context_has_captions: !!result.ai_context.video_captions
});

return result; 