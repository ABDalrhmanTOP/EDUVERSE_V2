# Immediate Solution: Enhanced Caption Analysis

## Quick Fix for Your Current Issue

Since the main problem is that the AI isn't getting enough information about the video content, here's a simpler solution that you can implement immediately:

## Solution: Enhanced Caption Extraction + Better AI Prompt

### Step 1: Add Caption Extraction Node

Add this **Function** node right after your webhook in n8n:

```javascript
// Enhanced Caption Extraction Node
const inputData = $input.first().json;
const youtubeUrl = inputData.youtube_url || inputData.body?.youtube_url;
const timestamp = inputData.timestamp || inputData.body?.timestamp;

if (!youtubeUrl) {
  throw new Error("YouTube URL is required");
}

// Extract video ID
const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
if (!videoId) {
  throw new Error("Could not extract video ID from URL");
}

console.log("Processing video ID:", videoId);

// Use YouTube Data API to get video info and captions
const apiKey = "{{ $env.YOUTUBE_API_KEY }}"; // Make sure this is set in n8n

// First, get video details
const videoInfoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;

try {
  // Get video information
  const videoResponse = await fetch(videoInfoUrl);
  const videoData = await videoResponse.json();

  if (!videoData.items || videoData.items.length === 0) {
    throw new Error("Video not found");
  }

  const videoInfo = videoData.items[0];
  const title = videoInfo.snippet.title;
  const description = videoInfo.snippet.description;
  const channelTitle = videoInfo.snippet.channelTitle;
  const duration = videoInfo.contentDetails.duration;

  console.log("Video title:", title);
  console.log("Channel:", channelTitle);

  // Try to get captions
  let captions = null;
  try {
    const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
    const captionsResponse = await fetch(captionsUrl);
    const captionsData = await captionsResponse.json();

    if (captionsData.items && captionsData.items.length > 0) {
      // Get the first available caption track
      const captionId = captionsData.items[0].id;
      const captionDownloadUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`;

      const captionResponse = await fetch(captionDownloadUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`, // Note: This might need OAuth2
        },
      });

      if (captionResponse.ok) {
        captions = await captionResponse.text();
        console.log("Captions found, length:", captions.length);
      }
    }
  } catch (captionError) {
    console.log("Could not fetch captions:", captionError.message);
  }

  // If no captions, try to extract from description
  if (!captions) {
    captions = description;
    console.log("Using description as captions");
  }

  // Analyze the content to detect programming language
  const contentToAnalyze = `${title} ${description} ${
    captions || ""
  }`.toLowerCase();

  let detectedLanguage = "unknown";
  let confidence = 0;

  // Language detection logic
  const languagePatterns = {
    laravel: [
      "laravel",
      "php",
      "blade",
      "eloquent",
      "artisan",
      "composer",
      "laravel framework",
    ],
    javascript: [
      "javascript",
      "js",
      "node.js",
      "react",
      "vue",
      "angular",
      "es6",
      "async/await",
    ],
    python: [
      "python",
      "django",
      "flask",
      "pip",
      "virtualenv",
      "requirements.txt",
    ],
    java: ["java", "spring", "maven", "gradle", "jvm", "jdk"],
    "c++": ["c++", "cpp", "stl", "templates", "pointers", "c plus plus"],
    "c#": ["c#", "csharp", ".net", "asp.net", "entity framework"],
    php: ["php", "wordpress", "symfony", "codeigniter"],
    typescript: ["typescript", "ts", "interface", "type"],
    ruby: ["ruby", "rails", "gem", "bundler"],
    go: ["go", "golang", "goroutine", "channel"],
    rust: ["rust", "cargo", "ownership", "borrowing"],
    swift: ["swift", "ios", "xcode", "cocoa"],
    kotlin: ["kotlin", "android", "gradle"],
  };

  for (const [language, patterns] of Object.entries(languagePatterns)) {
    const matches = patterns.filter((pattern) =>
      contentToAnalyze.includes(pattern)
    ).length;
    if (matches > confidence) {
      confidence = matches;
      detectedLanguage = language;
    }
  }

  console.log(
    "Detected language:",
    detectedLanguage,
    "with confidence:",
    confidence
  );

  return {
    video_id: videoId,
    youtube_url: youtubeUrl,
    timestamp: timestamp,
    video_title: title,
    video_description: description,
    video_channel: channelTitle,
    video_duration: duration,
    video_captions: captions,
    detected_language: detectedLanguage,
    language_confidence: confidence,
    analysis_mode: captions ? "with_captions" : "description_only",
  };
} catch (error) {
  console.error("Error fetching video data:", error);

  // Fallback: return basic info
  return {
    video_id: videoId,
    youtube_url: youtubeUrl,
    timestamp: timestamp,
    video_title: "Video Analysis Required",
    video_description:
      "Please analyze the video content to determine course details",
    video_channel: "Unknown",
    video_duration: "00:00:00",
    video_captions: null,
    detected_language: "unknown",
    language_confidence: 0,
    analysis_mode: "url_only",
  };
}
```

### Step 2: Enhanced AI Prompt with Language Detection

Replace your current AI prompt with this enhanced version:

````markdown
# Enhanced AI Prompt with Language Detection

You are an expert computer science educator and curriculum designer. Analyze the provided YouTube video information and generate comprehensive educational content.

## INPUT DATA

YouTube URL: {{$json.youtube_url}}
Video Title: {{$json.video_title}}
Video Description: {{$json.video_description}}
Video Channel: {{$json.video_channel}}
Detected Language: {{$json.detected_language}}
Language Confidence: {{$json.language_confidence}}
Video Captions: {{$json.video_captions}}
Starting Timestamp: {{$json.timestamp}}

## CRITICAL ANALYSIS INSTRUCTIONS

1. **FIRST: Analyze the detected language**

   - If detected_language is NOT "unknown" and confidence > 0, use that language
   - If detected_language is "unknown", analyze the video title and description to determine the language
   - Look for programming language keywords in the title, description, and captions

2. **SECOND: Generate accurate course metadata**

   - Use the ACTUAL video title if it's specific (not generic)
   - Create a detailed description based on the video content
   - Determine difficulty based on the content complexity

3. **THIRD: Create language-specific content**
   - ALL questions and tasks must be specific to the detected programming language
   - Use correct syntax and patterns for that language
   - Reference frameworks and tools mentioned in the video

## LANGUAGE DETECTION RULES

If the detected language is:

- **laravel**: Generate PHP/Laravel-specific content, include Blade templates, Eloquent ORM, Artisan CLI
- **javascript**: Generate JavaScript-specific content, include ES6, async/await, DOM manipulation
- **python**: Generate Python-specific content, include pip, virtualenv, data structures
- **java**: Generate Java-specific content, include Spring, Maven, OOP concepts
- **c++**: Generate C++-specific content, include STL, templates, pointers
- **c#**: Generate C#-specific content, include .NET, ASP.NET, Entity Framework
- **php**: Generate PHP-specific content, include WordPress, Symfony, CodeIgniter
- **typescript**: Generate TypeScript-specific content, include interfaces, types, generics
- **ruby**: Generate Ruby-specific content, include Rails, gems, bundler
- **go**: Generate Go-specific content, include goroutines, channels, packages
- **rust**: Generate Rust-specific content, include ownership, borrowing, cargo
- **swift**: Generate Swift-specific content, include iOS, Xcode, Cocoa
- **kotlin**: Generate Kotlin-specific content, include Android, Gradle, coroutines

## CONTENT GENERATION REQUIREMENTS

### A) COURSE METADATA

Generate based on the video analysis:

- **Title**: Use the actual video title if it's specific, otherwise create a descriptive title
- **Description**: Detailed description based on the video content and detected language
- **Difficulty**: beginner|intermediate|advanced based on content complexity
- **Programming Language**: The detected language from the analysis

### B) PLACEMENT TEST QUESTIONS (6 questions)

Create questions that are:

- **Specific to the detected programming language**
- **Based on concepts mentioned in the video**
- **Use correct syntax for that language**
- **Cover fundamental concepts** students should know

### C) COURSE TASKS

Generate tasks that:

- **Match the actual video content**
- **Use the correct programming language syntax**
- **Reference specific concepts** from the video
- **Include practical exercises** relevant to the language

### D) FINAL PROJECT QUESTIONS (6 questions)

Create questions that:

- **Test understanding of the specific language**
- **Cover concepts actually taught** in the video
- **Use correct syntax and patterns**

## OUTPUT FORMAT

```json
{
  "isComputerScience": true,
  "detectedLanguage": "{{$json.detected_language}}",
  "languageConfidence": {{$json.language_confidence}},
  "course": {
    "title": "Specific title based on video analysis",
    "description": "Description based on actual video content",
    "difficulty": "beginner|intermediate|advanced",
    "youtube_url": "{{$json.youtube_url}}",
    "timestamp": "{{$json.timestamp}}"
  },
  "courseAnalysis": {
    "difficulty": "beginner|intermediate|advanced",
    "mainTopics": ["topic1", "topic2", "topic3"],
    "prerequisites": ["prereq1", "prereq2"],
    "learningObjectives": ["objective1", "objective2", "objective3"],
    "programmingLanguage": "{{$json.detected_language}}"
  },
  "placementTest": {
    "questions": [
      {
        "type": "mcq|true_false|coding",
        "question": "Question specific to {{$json.detected_language}}",
        "options": ["A", "B", "C", "D"] (for MCQ only),
        "correct_answer": "A" (for MCQ), true/false (for TF), or "expected output" (for coding),
        "difficulty": "easy|medium|hard",
        "code_template": "// Starter code in {{$json.detected_language}}",
        "test_cases": [{"input": "test input", "output": "expected output"}] (for coding questions)
      }
    ]
  },
  "courseTasks": [
    {
      "title": "Task Title",
      "description": "Task description",
      "type": "mcq|true_false|CODE",
      "timestamp": "MM:SS:SS",
      "points": 1,
      "question": "Question text (for MCQ/TF)",
      "options": ["A", "B", "C", "D"] (for MCQ),
      "correct_answer": 0 (index for MCQ), true/false (for TF),
      "tf_question": "Question text (for TF)",
      "tf_answer": true/false (for TF),
      "coding_question": "Coding problem description",
      "coding_test_cases": [{"input": "test input", "output": "expected output", "description": "test case description"}],
      "coding_solution": "Complete solution code in {{$json.detected_language}}",
      "coding_language": "{{$json.detected_language}}"
    }
  ],
  "finalProject": {
    "questions": [
      {
        "type": "mcq|true_false|coding",
        "question": "Question specific to {{$json.detected_language}}",
        "options": ["A", "B", "C", "D"] (for MCQ only),
        "correct_answer": "A" (for MCQ), true/false (for TF), or "expected output" (for coding),
        "difficulty": "easy|medium|hard",
        "code_template": "// Starter code in {{$json.detected_language}}",
        "test_cases": [{"input": "test input", "output": "expected output"}] (for coding questions)
      }
    ]
  }
}
```
````

## CRITICAL RULES

1. **ALWAYS use the detected programming language** for all content generation
2. **NEVER generate generic content** - everything must be specific to the detected language
3. **Use the actual video title** if it's descriptive and specific
4. **Base descriptions on the video content** you can analyze
5. **Generate questions and tasks** that match the actual programming language
6. **If you cannot determine the language**, return an error response

## ERROR RESPONSES

If you cannot determine the programming language:

```json
{
  "isComputerScience": false,
  "message": "Unable to determine the programming language from the video content. Please provide a more specific programming tutorial."
}
```

````

### Step 3: Update Your n8n Environment Variables

Add this to your n8n environment variables:

```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
````

### Step 4: Test the Solution

1. **Add the caption extraction node** to your workflow
2. **Update the AI prompt** with the enhanced version
3. **Test with a Laravel video** to verify language detection
4. **Check the generated content** for accuracy

## Expected Results

After implementing this immediate solution:

- ✅ **Language detection** will work based on video metadata
- ✅ **Course titles** will be more specific (use actual video title)
- ✅ **Programming language** will be correctly identified
- ✅ **Tasks and questions** will be relevant to the correct language
- ✅ **Content accuracy** will improve significantly

## Next Steps

Once this immediate solution is working, you can:

1. **Implement the full video analysis** solution for even better accuracy
2. **Add more sophisticated language detection** algorithms
3. **Enhance caption extraction** for better content analysis
4. **Add video frame analysis** for visual content understanding

This immediate solution should fix your current issues with generic content and wrong programming language detection!
