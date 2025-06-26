# YouTube API Key Setup Guide

## Quick Setup Steps

### 1. Get Your API Key

**Visit Google Cloud Console:**

-   Go to: https://console.cloud.google.com/
-   Sign in with your Google account

**Create/Select Project:**

-   Click project dropdown → "New Project"
-   Name: "EduVerse YouTube API"
-   Click "Create"

**Enable YouTube API:**

-   Go to "APIs & Services" → "Library"
-   Search: "YouTube Data API v3"
-   Click "Enable"

**Create API Key:**

-   Go to "APIs & Services" → "Credentials"
-   Click "Create Credentials" → "API Key"
-   Copy the key (looks like: `AIzaSyC...`)

### 2. Add to Your Project

**Open your `.env` file in the Laravel project:**

```bash
# Navigate to your Laravel project
cd EDUVERS_V2/EDUVERS

# Open .env file (create if it doesn't exist)
notepad .env
```

**Add this line to your `.env` file:**

```env
YOUTUBE_API_KEY=AIzaSyC...your_actual_key_here...
```

### 3. Test the Feature

1. Start Laravel server: `php artisan serve`
2. Go to admin dashboard
3. Try adding a course with YouTube URL
4. Duration should auto-fetch!

## Example .env File

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:your_app_key_here
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Add this line for YouTube API
YOUTUBE_API_KEY=AIzaSyC...your_actual_key_here...
```

## Troubleshooting

**If you get "API key not configured":**

-   Check that you added the key to `.env`
-   Restart your Laravel server
-   Check Laravel logs: `storage/logs/laravel.log`

**If you get "API quota exceeded":**

-   YouTube API has daily limits
-   Free tier: 10,000 requests/day
-   Check usage in Google Cloud Console

**If duration doesn't fetch:**

-   Verify video is public
-   Check video ID is valid (11 characters)
-   Try a different YouTube video

## Security Notes

-   Never commit your API key to git
-   The `.env` file should be in `.gitignore`
-   You can restrict the API key to specific domains/IPs in Google Cloud Console
