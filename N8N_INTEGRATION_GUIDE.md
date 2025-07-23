# EduVerse n8n Integration Guide

## Overview

This guide explains how to set up n8n automation workflows to automatically generate course content (placement tests, tasks, and final projects) using Google Gemini AI for the EduVerse educational platform.

## Prerequisites

1. **n8n Installation**: n8n must be installed and running
2. **Google Gemini API Key**: Valid API key for Google Gemini AI
3. **EduVerse Backend**: Laravel backend must be running and accessible
4. **Environment Variables**: Proper configuration for API endpoints

## Environment Variables Setup

### n8n Environment Variables

Add these environment variables to your n8n instance:

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# EduVerse Backend API
EDUVERSE_API_URL=http://localhost:8000/api
EDUVERSE_API_TOKEN=your_laravel_sanctum_token_here

# n8n Webhook URL (for frontend integration)
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
```

### Frontend Environment Variables

Add to your React app's `.env` file:

```bash
REACT_APP_N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

## n8n Workflow Setup

### Step 1: Create New Workflow

1. Open n8n interface
2. Click "New Workflow"
3. Name it "EduVerse Course Content Generation"

### Step 2: Add Webhook Trigger

1. Add a **Webhook** node
2. Configure:
   - **HTTP Method**: POST
   - **Path**: `generate-course-content`
   - **Response Mode**: Response Node
   - **Response Headers**:
     ```
     Content-Type: application/json
     ```

### Step 3: Extract Course Info (Function Node)

Add a **Function** node with this code:

```javascript
// Extract and validate course data
const courseData = $input.first().json;

// Validate required fields
if (!courseData.video_id || !courseData.name || !courseData.description) {
  throw new Error("Missing required course information");
}

// Calculate course duration in minutes for task distribution
const durationParts = courseData.video_duration.split(":");
const durationMinutes =
  parseInt(durationParts[0]) * 60 +
  parseInt(durationParts[1]) +
  parseInt(durationParts[2]) / 60;

// Determine number of tasks based on course length
let taskCount = Math.max(3, Math.floor(durationMinutes / 15)); // 1 task per 15 minutes, minimum 3
if (durationMinutes > 120) taskCount = Math.min(taskCount, 12); // Cap at 12 tasks for very long courses

// Determine placement test questions (3-5 questions)
const placementQuestions = Math.min(
  5,
  Math.max(3, Math.floor(durationMinutes / 30))
);

// Determine final project questions (2-4 questions)
const finalProjectQuestions = Math.min(
  4,
  Math.max(2, Math.floor(durationMinutes / 45))
);

return {
  courseData,
  durationMinutes,
  taskCount,
  placementQuestions,
  finalProjectQuestions,
  videoUrl: `https://www.youtube.com/watch?v=${courseData.video_id}`,
};
```

### Step 4: Create AI Analysis Prompt (Function Node)

Add another **Function** node with this code:

```javascript
const {
  courseData,
  videoUrl,
  durationMinutes,
  taskCount,
  placementQuestions,
  finalProjectQuestions,
} = $input.first().json;

const prompt = `You are an expert computer science educator and curriculum designer. Analyze the following YouTube course and generate comprehensive educational content.

COURSE INFORMATION:
- Title: ${courseData.name}
- Description: ${courseData.description}
- Video URL: ${videoUrl}
- Duration: ${durationMinutes} minutes
- Year: ${courseData.year}
- Semester: ${courseData.semester}

TASK REQUIREMENTS:
Generate exactly ${taskCount} course tasks, ${placementQuestions} placement test questions, and ${finalProjectQuestions} final project questions.

ANALYSIS INSTRUCTIONS:
1. First, determine if this course is related to computer science, programming, or software development.
2. If YES, proceed with content generation. If NO, return only {"isComputerScience": false}.
3. Analyze the course content, difficulty level, and topics covered.
4. Generate content that matches the course's educational level and complexity.

CONTENT STRUCTURE REQUIREMENTS:

A) PLACEMENT TEST QUESTIONS (${placementQuestions} questions):
- Mix of MCQ (60%), True/False (25%), and Coding (15%)
- Cover fundamental concepts that students should know before taking this course
- Include questions about prerequisites and basic knowledge
- Difficulty: Easy to Medium

B) COURSE TASKS (${taskCount} tasks):
- Distribute evenly throughout the course duration
- Mix of MCQ (40%), True/False (30%), and Coding (30%)
- Tasks should test understanding of specific concepts taught in the course
- Include practical exercises and problem-solving
- Difficulty: Progressive (start easy, end challenging)

C) FINAL PROJECT QUESTIONS (${finalProjectQuestions} questions):
- Comprehensive assessment of course knowledge
- Mix of MCQ (30%), True/False (20%), and Coding (50%)
- Focus on practical application and synthesis
- Difficulty: Medium to Hard

OUTPUT FORMAT:
Return a valid JSON object with this exact structure:
{
  "isComputerScience": true,
  "courseAnalysis": {
    "difficulty": "beginner|intermediate|advanced",
    "mainTopics": ["topic1", "topic2", "topic3"],
    "prerequisites": ["prereq1", "prereq2"],
    "learningObjectives": ["objective1", "objective2", "objective3"]
  },
  "placementTest": {
    "questions": [
      {
        "type": "mcq|true_false|coding",
        "question": "Question text",
        "options": ["A", "B", "C", "D"] (for MCQ only),
        "correct_answer": "A" (for MCQ), true/false (for TF), or "expected output" (for coding),
        "difficulty": "easy|medium|hard",
        "code_template": "// Starter code" (for coding questions),
        "test_cases": [{"input": "test input", "output": "expected output"}] (for coding questions)
      }
    ]
  },
  "courseTasks": [
    {
      "title": "Task Title",
      "description": "Task description",
      "type": "mcq|true_false|CODE",
      "timestamp": "MM:SS:SS" (distributed throughout course),
      "points": 1,
      "question": "Question text (for MCQ/TF)",
      "options": ["A", "B", "C", "D"] (for MCQ),
      "correct_answer": 0 (index for MCQ), true/false (for TF),
      "tf_question": "Question text (for TF)",
      "tf_answer": true/false (for TF),
      "coding_question": "Coding problem description",
      "coding_test_cases": [{"input": "test input", "output": "expected output", "description": "test case description"}],
      "coding_solution": "Complete solution code",
      "coding_language": "javascript|python|java|cpp|csharp|php|typescript|kotlin|swift|rust|go|ruby"
    }
  ],
  "finalProject": {
    "questions": [
      {
        "type": "mcq|true_false|coding",
        "question": "Question text",
        "options": ["A", "B", "C", "D"] (for MCQ only),
        "correct_answer": "A" (for MCQ), true/false (for TF), or "expected output" (for coding),
        "difficulty": "easy|medium|hard",
        "code_template": "// Starter code" (for coding questions),
        "test_cases": [{"input": "test input", "output": "expected output"}] (for coding questions)
      }
    ]
  }
}

IMPORTANT:
- Ensure all timestamps are in MM:SS:SS format and distributed evenly throughout the course
- For coding questions, provide complete, working solutions
- Make questions relevant to the specific course content
- Ensure difficulty progression is logical
- All JSON must be valid and properly formatted`;

return { prompt };
```

### Step 5: Google Gemini AI Request (HTTP Request Node)

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Authentication**: Generic Credential Type
- **Generic Auth Type**: HTTP Header Auth
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
          }
        ]
      }
    ]
  }
  ```

### Step 6: Parse AI Response (Function Node)

Add a **Function** node:

```javascript
const aiResponse = $input.first().json;
const courseData = $("Extract Course Info").first().json;

try {
  // Extract the text content from Gemini response
  const responseText = aiResponse.candidates[0].content.parts[0].text;

  // Parse the JSON response
  const parsedContent = JSON.parse(responseText);

  if (!parsedContent.isComputerScience) {
    return {
      success: false,
      message:
        "This course is not related to computer science. Content generation skipped.",
      courseData,
    };
  }

  return {
    success: true,
    courseData,
    generatedContent: parsedContent,
  };
} catch (error) {
  throw new Error(`Failed to parse AI response: ${error.message}`);
}
```

### Step 7: Create Course in Database (HTTP Request Node)

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `{{ $env.EDUVERSE_API_URL }}/admin/courses`
- **Authentication**: Generic Credential Type
- **Generic Auth Type**: HTTP Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.EDUVERSE_API_TOKEN }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "name": "{{ $json.courseData.name }}",
    "description": "{{ $json.courseData.description }}",
    "video_id": "{{ $json.courseData.video_id }}",
    "video_duration": "{{ $json.courseData.video_duration }}",
    "year": "{{ $json.courseData.year }}",
    "semester": "{{ $json.courseData.semester }}",
    "paid": "{{ $json.courseData.paid }}",
    "tasks": "{{ $json.generatedContent.courseTasks }}"
  }
  ```

### Step 8: Create Placement Test (HTTP Request Node)

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `{{ $env.EDUVERSE_API_URL }}/admin/placement-tests`
- **Authentication**: Generic Credential Type
- **Generic Auth Type**: HTTP Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.EDUVERSE_API_TOKEN }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "course_id": "{{ $json.courseId }}",
    "title": "Placement Test - {{ $json.courseData.name }}",
    "description": "Assessment to determine student readiness for {{ $json.courseData.name }}"
  }
  ```

### Step 9: Create Placement Questions (HTTP Request Node)

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `{{ $env.EDUVERSE_API_URL }}/admin/placement-test-questions`
- **Authentication**: Generic Credential Type
- **Generic Auth Type**: HTTP Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.EDUVERSE_API_TOKEN }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "placement_test_id": "{{ $json.placementTestId }}",
    "questions": "{{ $json.generatedContent.placementTest.questions }}"
  }
  ```

### Step 10: Create Final Project (HTTP Request Node)

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `{{ $env.EDUVERSE_API_URL }}/admin/final-projects`
- **Authentication**: Generic Credential Type
- **Generic Auth Type**: HTTP Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.EDUVERSE_API_TOKEN }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "course_id": "{{ $json.courseId }}",
    "title": "Final Project - {{ $json.courseData.name }}",
    "description": "Comprehensive assessment for {{ $json.courseData.name }}"
  }
  ```

### Step 11: Create Final Project Questions (HTTP Request Node)

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `{{ $env.EDUVERSE_API_URL }}/admin/final-project-questions`
- **Authentication**: Generic Credential Type
- **Generic Auth Type**: HTTP Header Auth
- **Name**: `Authorization`
- **Value**: `Bearer {{ $env.EDUVERSE_API_TOKEN }}`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "final_project_id": "{{ $json.finalProjectId }}",
    "questions": "{{ $json.generatedContent.finalProject.questions }}"
  }
  ```

### Step 12: Success Response (Respond to Webhook Node)

Add a **Respond to Webhook** node:

```javascript
const courseData = $("Extract Course Info").first().json;
const courseResult = $("Create Course in Database").first().json;
const placementResult = $("Create Placement Test").first().json;
const finalProjectResult = $("Create Final Project").first().json;

return {
  statusCode: 200,
  body: {
    success: true,
    message: "Course content generated successfully!",
    data: {
      course: courseResult,
      placementTest: placementResult,
      finalProject: finalProjectResult,
      generatedTasks: courseResult.tasks?.length || 0,
      generatedPlacementQuestions: placementResult.questions?.length || 0,
      generatedFinalProjectQuestions: finalProjectResult.questions?.length || 0,
    },
  },
};
```

### Step 13: Error Response (Respond to Webhook Node)

Add another **Respond to Webhook** node for error handling:

```javascript
const error = $input.first().json;

return {
  statusCode: 500,
  body: {
    success: false,
    message: "Failed to generate course content",
    error: error.message || "Unknown error occurred",
  },
};
```

## Workflow Connections

Connect the nodes in this order:

1. **Webhook** → **Extract Course Info**
2. **Extract Course Info** → **Create AI Prompt**
3. **Create AI Prompt** → **Google Gemini AI**
4. **Google Gemini AI** → **Parse AI Response**
5. **Parse AI Response** → **Create Course** (if success)
6. **Create Course** → **Create Placement Test**
7. **Create Placement Test** → **Create Placement Questions**
8. **Create Placement Questions** → **Create Final Project**
9. **Create Final Project** → **Create Final Project Questions**
10. **Create Final Project Questions** → **Success Response**

For error handling:

- **Parse AI Response** → **Error Response** (if error)
- **Create Course** → **Error Response** (if error)
- **Create Placement Test** → **Error Response** (if error)
- **Create Final Project** → **Error Response** (if error)

## Testing the Workflow

### Test Data

Use this sample data to test the workflow:

```json
{
  "video_id": "dQw4w9WgXcQ",
  "name": "Introduction to JavaScript Programming",
  "description": "Learn the fundamentals of JavaScript programming language including variables, functions, and DOM manipulation.",
  "video_duration": "01:30:00",
  "year": 1,
  "semester": 1,
  "paid": false
}
```

### Expected Response

```json
{
  "success": true,
  "message": "Course content generated successfully!",
  "data": {
    "course": {
      /* course data */
    },
    "placementTest": {
      /* placement test data */
    },
    "finalProject": {
      /* final project data */
    },
    "generatedTasks": 6,
    "generatedPlacementQuestions": 4,
    "generatedFinalProjectQuestions": 3
  }
}
```

## Troubleshooting

### Common Issues

1. **API Key Issues**

   - Verify Google Gemini API key is valid
   - Check API quota and billing status

2. **Authentication Issues**

   - Ensure Laravel Sanctum token is valid
   - Check token permissions for admin routes

3. **JSON Parsing Errors**

   - Verify AI response format matches expected structure
   - Check for malformed JSON in AI response

4. **Database Errors**
   - Ensure all required database tables exist
   - Check foreign key constraints

### Debug Mode

Enable debug mode in n8n to see detailed execution logs:

1. Go to n8n settings
2. Enable "Debug Mode"
3. Check execution logs for detailed error information

## Security Considerations

1. **API Key Security**

   - Store API keys in environment variables
   - Never commit API keys to version control
   - Use different keys for development and production

2. **Input Validation**

   - Validate all input data before processing
   - Sanitize user inputs to prevent injection attacks

3. **Rate Limiting**

   - Implement rate limiting for the webhook endpoint
   - Monitor API usage to prevent abuse

4. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log errors for debugging without exposing details

## Performance Optimization

1. **Caching**

   - Cache AI responses for similar course content
   - Implement request deduplication

2. **Async Processing**

   - Consider using queues for long-running operations
   - Implement webhook response timeouts

3. **Monitoring**
   - Monitor workflow execution times
   - Set up alerts for failed executions

## Production Deployment

1. **Environment Setup**

   - Use production-grade n8n instance
   - Configure proper SSL certificates
   - Set up monitoring and logging

2. **Backup Strategy**

   - Regular backups of n8n workflows
   - Database backups for generated content

3. **Scaling**
   - Consider horizontal scaling for high traffic
   - Implement load balancing if needed

## Support

For issues or questions:

1. Check n8n documentation: https://docs.n8n.io/
2. Review Google Gemini API documentation
3. Check EduVerse backend logs for database errors
4. Monitor n8n execution logs for workflow issues
