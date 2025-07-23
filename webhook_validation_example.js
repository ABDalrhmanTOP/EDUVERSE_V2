// Webhook Input Validation Example
// Add this as a Code node right after the webhook to validate input

const requiredFields = ['videoId', 'title', 'captions'];
const missingFields = [];

// Check for required fields
for (const field of requiredFields) {
  if (!inputData.json[field]) {
    missingFields.push(field);
  }
}

// Validate captions content
if (inputData.json.captions && inputData.json.captions.trim().length < 50) {
  missingFields.push('captions (too short or empty)');
}

if (missingFields.length > 0) {
  return {
    success: false,
    error: `Missing required fields: ${missingFields.join(', ')}`,
    receivedData: Object.keys(inputData.json)
  };
}

// Validate video duration if present
if (inputData.json.duration && isNaN(parseInt(inputData.json.duration))) {
  return {
    success: false,
    error: 'Invalid duration format',
    receivedData: inputData.json.duration
  };
}

// If validation passes, continue with the data
return {
  success: true,
  validatedData: inputData.json
}; 