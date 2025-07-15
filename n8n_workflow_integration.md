# Frontend Integration for n8n Workflow

## Current Workflow Modification

### 1. Webhook Trigger Configuration

Replace the current manual trigger with a webhook trigger that accepts:

```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "timestamp": "00:05:30"
}
```

### 2. AI Agent Prompt Update

Modify the AI agent prompt to:

- Accept YouTube URL and timestamp as input
- Analyze the video to determine course title and description
- Generate comprehensive educational content

### 3. Frontend API Integration

Create an endpoint in Laravel to:

- Accept YouTube URL from frontend
- Trigger n8n workflow via webhook
- Return workflow status to frontend

## Implementation Steps

### Step 1: Update n8n Workflow

1. Replace manual trigger with webhook trigger
2. Update AI agent prompt to analyze YouTube video
3. Test with sample data

### Step 2: Create Laravel Controller

1. Create CourseGenerationController
2. Add method to trigger n8n workflow
3. Handle webhook responses

### Step 3: Frontend Integration

1. Update frontend to send YouTube URL and timestamp
2. Call Laravel API endpoint
3. Handle response and display status

## Files to Modify/Create

- n8n workflow (webhook trigger + AI prompt)
- Laravel: CourseGenerationController
- Frontend: API integration
