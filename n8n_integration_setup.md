# n8n Integration Setup Guide

## Environment Configuration

Add the following environment variable to your Laravel `.env` file:

```env
# N8N Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/course-generation
```

Replace `http://localhost:5678` with your actual n8n instance URL.

## n8n Workflow Configuration

### 1. Create Webhook Trigger

1. In your n8n workflow, replace the manual trigger with a **Webhook** node
2. Configure the webhook:
   - **HTTP Method**: POST
   - **Path**: `/course-generation`
   - **Response Mode**: Respond to Webhook
   - **Options**:
     - Enable "Respond with all data"
     - Set "Response Code" to 200

### 2. Update AI Agent Node

1. In your Google Gemini AI Agent node, update the prompt to use the new format from `n8n_ai_agent_prompt_updated.md`
2. Configure the input variables:
   - `youtube_url`: `{{$json.youtube_url}}`
   - `timestamp`: `{{$json.timestamp}}`

### 3. Test the Integration

1. Start your n8n workflow
2. Test with a sample request:

```bash
curl -X POST http://localhost:5678/webhook/course-generation \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=example",
    "timestamp": "00:05:30"
  }'
```

## Frontend Integration Steps

### 1. Update Your Frontend

Use the provided `frontend_integration_example.js` as a reference to integrate with your existing frontend.

### 2. API Endpoints Available

- `POST /api/course/generate` - Start course generation
- `GET /api/course/status` - Check generation status
- `GET /api/course/generated` - Get generated course data

### 3. Testing the Complete Flow

1. Start your Laravel backend
2. Start your n8n workflow
3. Use the frontend to submit a YouTube URL
4. Monitor the generation process
5. Verify the course is created in your database

## Troubleshooting

### Common Issues

1. **Webhook not receiving data**: Check n8n webhook URL and Laravel environment variable
2. **AI agent not analyzing video**: Ensure the prompt includes video analysis instructions
3. **Database errors**: Check Laravel logs for validation or database issues
4. **Timeout errors**: Increase timeout values in the CourseGenerationController

### Debug Steps

1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check n8n execution logs in the n8n interface
3. Verify API responses using browser dev tools or Postman
4. Test individual components separately

## Next Steps

1. **Implement Status Tracking**: Add a database table to track generation status
2. **Add Error Handling**: Implement retry logic and better error messages
3. **Optimize Performance**: Consider async processing for long-running generations
4. **Add Authentication**: Secure the endpoints if needed
5. **Add Rate Limiting**: Prevent abuse of the generation service
