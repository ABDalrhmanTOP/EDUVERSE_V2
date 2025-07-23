# Gemini Video Analysis Workflow - Complete Solution

## The Real Problem

Gemini 2.5 Pro CAN analyze videos, but we need to:

1. **Download the video** or get video frames
2. **Use Gemini's multimodal capabilities** to analyze video content
3. **Extract captions/transcripts** for text analysis
4. **Combine video + text analysis** for accurate content generation

## Solution 1: Enhanced n8n Workflow with Video Analysis

### Step 1: Add Video Download Node

Add a **Function** node after the webhook to download video:

```javascript
// Video Download and Analysis Node
const inputData = $input.first().json;
const youtubeUrl = inputData.youtube_url;
const videoId = youtubeUrl.split("v=")[1].split("&")[0];

// Use yt-dlp to download video (requires yt-dlp installation)
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const downloadDir = "/tmp/videos";
const videoPath = `${downloadDir}/${videoId}.mp4`;

// Create directory if it doesn't exist
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Download video using yt-dlp
return new Promise((resolve, reject) => {
  exec(
    `yt-dlp -f "best[height<=720]" -o "${videoPath}" "${youtubeUrl}"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Error downloading video:", error);
        // Fallback to caption-only analysis
        resolve({
          videoPath: null,
          videoId: videoId,
          youtubeUrl: youtubeUrl,
          timestamp: inputData.timestamp,
          fallbackMode: true,
        });
      } else {
        console.log("Video downloaded successfully:", videoPath);
        resolve({
          videoPath: videoPath,
          videoId: videoId,
          youtubeUrl: youtubeUrl,
          timestamp: inputData.timestamp,
          fallbackMode: false,
        });
      }
    }
  );
});
```

### Step 2: Extract Video Frames for Analysis

Add another **Function** node to extract frames:

```javascript
// Extract Video Frames for AI Analysis
const inputData = $input.first().json;

if (!inputData.videoPath) {
  // Fallback mode - use captions only
  return {
    ...inputData,
    frames: [],
    captions: null,
    analysisMode: "captions_only",
  };
}

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const videoPath = inputData.videoPath;
const framesDir = `/tmp/frames/${inputData.videoId}`;

// Create frames directory
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

// Extract frames every 10 seconds for analysis
return new Promise((resolve, reject) => {
  exec(
    `ffmpeg -i "${videoPath}" -vf "fps=1/10" -frame_pts 1 "${framesDir}/frame_%d.jpg"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Error extracting frames:", error);
        resolve({
          ...inputData,
          frames: [],
          captions: null,
          analysisMode: "captions_only",
        });
      } else {
        // Get list of extracted frames
        const frames = fs
          .readdirSync(framesDir)
          .filter((file) => file.endsWith(".jpg"))
          .map((file) => `${framesDir}/${file}`)
          .slice(0, 10); // Limit to 10 frames for analysis

        resolve({
          ...inputData,
          frames: frames,
          captions: null,
          analysisMode: "video_frames",
        });
      }
    }
  );
});
```

### Step 3: Enhanced Gemini AI Prompt with Video Analysis

Update your AI agent prompt to use Gemini's multimodal capabilities:

````markdown
# Enhanced Gemini AI Prompt with Video Analysis

You are an expert computer science educator and curriculum designer. You will analyze a YouTube video using both video frames and text content to generate comprehensive educational content.

## INPUT DATA

YouTube URL: {{$json.youtube_url}}
Starting Timestamp: {{$json.timestamp}}
Video Frames: [Multiple video frames will be provided]
Video Captions: {{$json.video_captions}}

## ANALYSIS INSTRUCTIONS

1. **ANALYZE THE VIDEO FRAMES**: Look at the provided video frames to understand:

   - What programming language/framework is being demonstrated
   - What tools/IDEs are being used
   - What code examples are shown
   - What concepts are being explained

2. **ANALYZE THE CAPTIONS**: Read through the video captions to understand:

   - The specific topics covered
   - The programming language syntax used
   - The concepts and terminology mentioned
   - The difficulty level of the content

3. **COMBINE VIDEO + TEXT ANALYSIS**: Use both visual and textual information to:
   - Determine the exact programming language being taught
   - Identify specific frameworks, libraries, or tools mentioned
   - Understand the learning objectives and target audience
   - Generate accurate course metadata

## CONTENT GENERATION REQUIREMENTS

### A) COURSE METADATA (Based on Video Analysis)

Generate based on what you actually see and hear in the video:

- **Title**: Specific title mentioning the exact programming language/framework shown
- **Description**: Detailed description based on the actual content you analyzed
- **Difficulty**: Based on the complexity level you observed
- **Programming Language**: The exact language you identified from the video

### B) PLACEMENT TEST QUESTIONS

Create questions that are:

- **Specific to the programming language** you identified in the video
- **Based on concepts actually mentioned** in the captions
- **Relevant to the tools/frameworks** shown in the video frames

### C) COURSE TASKS

Generate tasks that:

- **Match the actual content** you analyzed from the video
- **Use the correct programming language** syntax you observed
- **Reference specific concepts** mentioned in the captions
- **Include practical exercises** similar to what was demonstrated

### D) FINAL PROJECT QUESTIONS

Create questions that:

- **Test understanding of the specific language** shown in the video
- **Cover concepts actually taught** in the video content
- **Use the correct syntax and patterns** you observed

## OUTPUT FORMAT

```json
{
  "isComputerScience": true,
  "detectedLanguage": "laravel|javascript|python|java|cpp|csharp|php|typescript|kotlin|swift|rust|go|ruby",
  "videoAnalysis": {
    "observedTools": ["tool1", "tool2"],
    "observedConcepts": ["concept1", "concept2"],
    "difficultyLevel": "beginner|intermediate|advanced",
    "targetAudience": "description"
  },
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
    "programmingLanguage": "detected_language"
  },
  "placementTest": {
    "questions": [
      {
        "type": "mcq|true_false|coding",
        "question": "Question specific to the detected language",
        "options": ["A", "B", "C", "D"] (for MCQ only),
        "correct_answer": "A" (for MCQ), true/false (for TF), or "expected output" (for coding),
        "difficulty": "easy|medium|hard",
        "code_template": "// Starter code in the detected language",
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
      "coding_solution": "Complete solution code in the detected language",
      "coding_language": "detected_language"
    }
  ],
  "finalProject": {
    "questions": [
      {
        "type": "mcq|true_false|coding",
        "question": "Question specific to the detected language",
        "options": ["A", "B", "C", "D"] (for MCQ only),
        "correct_answer": "A" (for MCQ), true/false (for TF), or "expected output" (for coding),
        "difficulty": "easy|medium|hard",
        "code_template": "// Starter code in the detected language",
        "test_cases": [{"input": "test input", "output": "expected output"}] (for coding questions)
      }
    ]
  }
}
```
````

## CRITICAL RULES

1. **ALWAYS base your analysis on the actual video content** you can see and hear
2. **NEVER generate generic content** - everything must be specific to what you observed
3. **Use the exact programming language** you identified from the video frames and captions
4. **Reference specific tools, frameworks, and concepts** you observed in the video
5. **Generate questions and tasks that match the actual difficulty level** you observed
6. **If you cannot clearly identify the programming language**, return an error response

## ERROR RESPONSES

If you cannot analyze the video content:

```json
{
  "isComputerScience": false,
  "message": "Unable to analyze the video content. The video may be unavailable or the content is not clear enough for analysis."
}
```

````

### Step 4: Enhanced Gemini API Call

Update your HTTP Request node to use Gemini's multimodal capabilities:

```javascript
// Enhanced Gemini API Call with Video Analysis
const inputData = $input.first().json;
const frames = inputData.frames || [];
const captions = inputData.video_captions || '';

// Prepare the prompt
const prompt = `[Your enhanced prompt from above]`;

// Prepare content parts
const contentParts = [
  {
    text: prompt
  }
];

// Add video frames if available
if (frames.length > 0) {
  frames.forEach(framePath => {
    try {
      const frameData = fs.readFileSync(framePath);
      const base64Data = frameData.toString('base64');

      contentParts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data
        }
      });
    } catch (error) {
      console.error('Error reading frame:', error);
    }
  });
}

// Add captions if available
if (captions) {
  contentParts.push({
    text: `\n\nVIDEO CAPTIONS:\n${captions}`
  });
}

// Make the API call
const requestBody = {
  contents: [
    {
      parts: contentParts
    }
  ],
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
};

return {
  method: 'POST',
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': '{{ $env.GEMINI_API_KEY }}'
  },
  body: JSON.stringify(requestBody)
};
````

## Solution 2: Caption-Only Analysis (Simpler Alternative)

If video download is too complex, use enhanced caption analysis:

### Enhanced Caption Extraction

```javascript
// Enhanced Caption Extraction Node
const inputData = $input.first().json;
const youtubeUrl = inputData.youtube_url;
const videoId = youtubeUrl.split("v=")[1].split("&")[0];

// Use YouTube Data API to get captions
const { exec } = require("child_process");

return new Promise((resolve, reject) => {
  // Use youtube-transcript-api or similar
  exec(
    `python3 -c "
import sys
from youtube_transcript_api import YouTubeTranscriptApi

try:
    transcript = YouTubeTranscriptApi.get_transcript('${videoId}')
    captions = ' '.join([entry['text'] for entry in transcript])
    print(captions)
except Exception as e:
    print('Error:', str(e))
"`,
    (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("Error extracting captions:", error || stderr);
        resolve({
          ...inputData,
          video_captions: null,
          analysisMode: "url_only",
        });
      } else {
        const captions = stdout.trim();
        console.log("Captions extracted:", captions.substring(0, 200) + "...");
        resolve({
          ...inputData,
          video_captions: captions,
          analysisMode: "captions_available",
        });
      }
    }
  );
});
```

## Solution 3: Hybrid Approach (Recommended)

Combine both approaches:

1. **Try video download and frame extraction** first
2. **Fall back to caption extraction** if video download fails
3. **Use URL-only analysis** as last resort

## Implementation Steps

1. **Install required tools**:

   ```bash
   # For video download
   npm install yt-dlp

   # For frame extraction
   npm install ffmpeg-static

   # For captions
   pip install youtube-transcript-api
   ```

2. **Update your n8n workflow** with the enhanced nodes
3. **Test with a known Laravel video** to verify language detection
4. **Monitor the analysis quality** and adjust as needed

## Expected Results

After implementing this:

- ✅ **AI will actually see the video content** (frames + captions)
- ✅ **Programming language detection** will be based on actual video analysis
- ✅ **Course titles and descriptions** will be specific to the content
- ✅ **Tasks and questions** will match the actual programming language shown
- ✅ **Content accuracy** will improve dramatically

The key insight is that **Gemini needs to actually see the video content** to generate accurate analysis. The current approach of just sending a URL doesn't work because the AI can't access the video directly.

Would you like me to help you implement one of these solutions?
