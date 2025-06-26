# YouTube API Setup for Video Duration

This feature automatically fetches video duration from YouTube when adding courses.

## Setup Instructions

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key

### 2. Configure Environment

Add the API key to your `.env` file:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. How It Works

-   When you enter a YouTube video URL in the course form, the system automatically extracts the video ID
-   The backend calls the YouTube API to fetch the video duration
-   The duration is converted to HH:MM:SS format and auto-filled in the form
-   If the API key is not configured, a default duration (10 minutes) is used

### 4. Fallback Behavior

If the YouTube API is not configured or fails:

-   The system will use a default duration of 10 minutes
-   Users can still manually edit the duration field
-   No error messages are shown to users

### 5. API Quota

The YouTube Data API has a daily quota limit. For most educational use cases, the free tier should be sufficient.

## Testing

To test the feature:

1. Start your Laravel server: `php artisan serve`
2. Go to the admin dashboard
3. Try adding a new course with a YouTube video URL
4. The duration should be automatically fetched and filled in

## Troubleshooting

-   Check the Laravel logs for any API errors
-   Ensure your API key has the YouTube Data API v3 enabled
-   Verify the video ID is valid (11 characters)
-   Check that the video is publicly accessible
