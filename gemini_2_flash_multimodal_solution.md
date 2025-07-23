# Gemini 2.0 Flash Multimodal Solution

## Overview

Use Gemini 2.0 Flash multimodal agent to directly analyze YouTube videos without downloading them. This approach is cleaner, faster, and more efficient.

## Key Changes Required

### 1. Update AI Model to Gemini 2.0 Flash Multimodal

Change your HTTP Request node to use the correct model:

```javascript
// Updated Gemini API Call for Multimodal Analysis
const inputData = $input.first().json;
const youtubeUrl = inputData.youtube_url || inputData.body?.youtube_url;
const timestamp = inputData.timestamp || inputData.body?.timestamp;

// Prepare the multimodal prompt
const prompt = `You are an expert computer science educator and curriculum designer. 

## YOUR TASK
Analyze the provided YouTube video and generate comprehensive educational content.

## VIDEO TO ANALYZE
YouTube URL: ${youtubeUrl}
Starting Timestamp: ${timestamp}

## ANALYSIS INSTRUCTIONS

1. **WATCH AND ANALYZE THE VIDEO**: 
   - Watch the video starting from the provided timestamp
   - Identify the programming language being taught
   - Understand the concepts, tools, and frameworks demonstrated
   - Determine the difficulty level and target audience

2. **DETECT THE PROGRAMMING LANGUAGE**:
   Look for visual and audio cues:
   - Code syntax shown in the video
   - IDE/editor being used
   - Framework names mentioned
   - File extensions shown
   - Terminal commands displayed
   - Package managers mentioned

3. **GENERATE ACCURATE CONTENT**:
   - Use the actual video title if it's specific
   - Create description based on what you observed
   - Generate questions and tasks specific to the detected language
   - Reference actual concepts and tools shown in the video

## CONTENT REQUIREMENTS

### A) COURSE METADATA
- **Title**: Use the actual video title or create a specific title based on content
- **Description**: Detailed description of what you observed in the video
- **Difficulty**: beginner|intermediate|advanced based on content complexity
- **Programming Language**: The exact language you identified from the video

### B) PLACEMENT TEST QUESTIONS (6 questions)
Create questions that are:
- Specific to the programming language you observed
- Based on concepts actually demonstrated in the video
- Use correct syntax for that language
- Cover fundamental concepts students should know

### C) COURSE TASKS
Generate tasks that:
- Match the actual content you observed in the video
- Use the correct programming language syntax
- Reference specific concepts and tools shown
- Include practical exercises similar to what was demonstrated

### D) FINAL PROJECT QUESTIONS (6 questions)
Create questions that:
- Test understanding of the specific language shown
- Cover concepts actually taught in the video
- Use correct syntax and patterns you observed

## OUTPUT FORMAT

Return a valid JSON object with this exact structure:

\`\`\`json
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
    "youtube_url": "${youtubeUrl}",
    "timestamp": "${timestamp}"
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
\`\`\`

## CRITICAL RULES

1. **WATCH THE ENTIRE VIDEO** starting from the timestamp before generating any content
2. **ALWAYS base your analysis on what you actually see and hear** in the video
3. **NEVER generate generic content** - everything must be specific to the video
4. **Use the exact programming language** you identified from the video
5. **Reference specific tools, frameworks, and concepts** you observed
6. **Generate questions and tasks that match the actual difficulty level** you observed
7. **If you cannot clearly identify the programming language**, return an error response

## ERROR RESPONSES

If you cannot analyze the video content:

\`\`\`json
{
  "isComputerScience": false,
  "message": "Unable to analyze the video content. The video may be unavailable or the content is not clear enough for analysis."
}
\`\`\`

Remember: You have direct access to watch and analyze the YouTube video. Use this capability to generate accurate, video-specific content.`;

// Prepare the request body for multimodal analysis
const requestBody = {
  contents: [
    {
      parts: [
        {
          text: prompt,
        },
        {
          // This tells Gemini to analyze the YouTube video directly
          youtube_metadata: {
            video_id: youtubeUrl.split("v=")[1]?.split("&")[0],
            start_time: timestamp,
          },
        },
      ],
    },
  ],
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
};

return {
  method: "POST",
  url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
  headers: {
    "Content-Type": "application/json",
    "x-goog-api-key": "{{ $env.GEMINI_API_KEY }}",
  },
  body: JSON.stringify(requestBody),
};
```

### 2. Update Your n8n Workflow

Replace your current "Extract Course Info" node with a simpler one:

```javascript
// Simplified Course Info Node for Multimodal Analysis
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

console.log("Processing video for multimodal analysis:", videoId);

// Return minimal data - Gemini will analyze the video directly
return {
  youtube_url: youtubeUrl,
  timestamp: timestamp,
  video_id: videoId,
  analysis_mode: "multimodal_direct",
};
```

### 3. Update Your AI Prompt Node

Replace your current AI prompt with this multimodal version:

```javascript
// Multimodal AI Prompt Node
const inputData = $input.first().json;

const prompt = `You are an expert computer science educator and curriculum designer. 

## YOUR TASK
Analyze the provided YouTube video and generate comprehensive educational content.

## VIDEO TO ANALYZE
YouTube URL: ${inputData.youtube_url}
Starting Timestamp: ${inputData.timestamp}

## ANALYSIS INSTRUCTIONS

1. **WATCH AND ANALYZE THE VIDEO**: 
   - Watch the video starting from the provided timestamp
   - Identify the programming language being taught
   - Understand the concepts, tools, and frameworks demonstrated
   - Determine the difficulty level and target audience

2. **DETECT THE PROGRAMMING LANGUAGE**:
   Look for visual and audio cues:
   - Code syntax shown in the video
   - IDE/editor being used
   - Framework names mentioned
   - File extensions shown
   - Terminal commands displayed
   - Package managers mentioned

3. **GENERATE ACCURATE CONTENT**:
   - Use the actual video title if it's specific
   - Create description based on what you observed
   - Generate questions and tasks specific to the detected language
   - Reference actual concepts and tools shown in the video

## CONTENT REQUIREMENTS

### A) COURSE METADATA
- **Title**: Use the actual video title or create a specific title based on content
- **Description**: Detailed description of what you observed in the video
- **Difficulty**: beginner|intermediate|advanced based on content complexity
- **Programming Language**: The exact language you identified from the video

### B) PLACEMENT TEST QUESTIONS (6 questions)
Create questions that are:
- Specific to the programming language you observed
- Based on concepts actually demonstrated in the video
- Use correct syntax for that language
- Cover fundamental concepts students should know

### C) COURSE TASKS
Generate tasks that:
- Match the actual content you observed in the video
- Use the correct programming language syntax
- Reference specific concepts and tools shown
- Include practical exercises similar to what was demonstrated

### D) FINAL PROJECT QUESTIONS (6 questions)
Create questions that:
- Test understanding of the specific language shown
- Cover concepts actually taught in the video
- Use correct syntax and patterns you observed

## OUTPUT FORMAT

Return a valid JSON object with this exact structure:

\`\`\`json
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
    "youtube_url": "${inputData.youtube_url}",
    "timestamp": "${inputData.timestamp}"
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
\`\`\`

## CRITICAL RULES

1. **WATCH THE ENTIRE VIDEO** starting from the timestamp before generating any content
2. **ALWAYS base your analysis on what you actually see and hear** in the video
3. **NEVER generate generic content** - everything must be specific to the video
4. **Use the exact programming language** you identified from the video
5. **Reference specific tools, frameworks, and concepts** you observed
6. **Generate questions and tasks that match the actual difficulty level** you observed
7. **If you cannot clearly identify the programming language**, return an error response

## ERROR RESPONSES

If you cannot analyze the video content:

\`\`\`json
{
  "isComputerScience": false,
  "message": "Unable to analyze the video content. The video may be unavailable or the content is not clear enough for analysis."
}
\`\`\`

Remember: You have direct access to watch and analyze the YouTube video. Use this capability to generate accurate, video-specific content.`;

return { prompt };
```

### 4. Update Your HTTP Request Node

Configure your HTTP Request node with these settings:

- **Method**: POST
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- **Authentication**: HTTP Header Auth
- **Name**: `x-goog-api-key`
- **Value**: `{{ $env.GEMINI_API_KEY }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "contents": [
      {
        "parts": [
          {
            "text": "{{ $json.prompt }}"
          },
          {
            "youtube_metadata": {
              "video_id": "{{ $json.video_id }}",
              "start_time": "{{ $json.timestamp }}"
            }
          }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0.7,
      "topK": 40,
      "topP": 0.95,
      "maxOutputTokens": 8192
    }
  }
  ```

## Key Benefits of This Approach

1. **No video downloading** - Gemini analyzes directly
2. **Real-time analysis** - No storage requirements
3. **Accurate content** - Based on actual video observation
4. **Language detection** - Visual and audio analysis
5. **Specific content** - References actual tools and concepts shown

## Expected Results

After implementing this:

- ✅ **AI will actually watch the video** and analyze its content
- ✅ **Programming language detection** will be based on visual/audio analysis
- ✅ **Course titles** will be specific to the actual video content
- ✅ **Tasks and questions** will match the correct programming language
- ✅ **Content accuracy** will be dramatically improved

## Implementation Steps

1. **Update your n8n workflow** with the simplified course info node
2. **Replace your AI prompt** with the multimodal version
3. **Update your HTTP Request node** to use Gemini 2.0 Flash multimodal
4. **Test with a Laravel video** to verify the analysis works
5. **Monitor the generated content** for accuracy

This approach leverages Gemini's native multimodal capabilities to directly analyze YouTube videos, which should solve your content accuracy issues!
