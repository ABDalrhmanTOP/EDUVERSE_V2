// Frontend Integration Example for Course Generation

class CourseGenerationAPI {
    constructor(baseURL = 'http://localhost:8000/api') {
        this.baseURL = baseURL;
    }

    /**
     * Generate course content from YouTube URL and timestamp
     * @param {string} youtubeUrl - The YouTube video URL
     * @param {string} timestamp - Timestamp in HH:MM:SS format
     * @returns {Promise} - API response
     */
    async generateCourse(youtubeUrl, timestamp) {
        try {
            const response = await fetch(`${this.baseURL}/course/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    youtube_url: youtubeUrl,
                    timestamp: timestamp
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate course');
            }

            return data;
        } catch (error) {
            console.error('Course generation error:', error);
            throw error;
        }
    }

    /**
     * Check the status of course generation
     * @param {string} requestId - The request ID returned from generateCourse
     * @returns {Promise} - Status response
     */
    async checkStatus(requestId) {
        try {
            const response = await fetch(`${this.baseURL}/course/status?request_id=${requestId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to check status');
            }

            return data;
        } catch (error) {
            console.error('Status check error:', error);
            throw error;
        }
    }

    /**
     * Get the generated course data
     * @param {string} requestId - The request ID returned from generateCourse
     * @returns {Promise} - Course data response
     */
    async getGeneratedCourse(requestId) {
        try {
            const response = await fetch(`${this.baseURL}/course/generated?request_id=${requestId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get course data');
            }

            return data;
        } catch (error) {
            console.error('Get course data error:', error);
            throw error;
        }
    }
}

// Example usage in a React component or vanilla JS
class CourseGenerator {
    constructor() {
        this.api = new CourseGenerationAPI();
        this.isGenerating = false;
    }

    /**
     * Handle YouTube URL input and course generation
     * @param {string} youtubeUrl - YouTube video URL
     * @param {string} timestamp - Auto-fetched timestamp
     */
    async handleCourseGeneration(youtubeUrl, timestamp) {
        if (this.isGenerating) {
            console.log('Course generation already in progress...');
            return;
        }

        this.isGenerating = true;
        this.updateUI('Generating course content...', 'info');

        try {
            // Step 1: Start course generation
            const generationResponse = await this.api.generateCourse(youtubeUrl, timestamp);
            
            if (generationResponse.success) {
                const requestId = generationResponse.request_id;
                this.updateUI('Course generation started successfully!', 'success');
                
                // Step 2: Poll for status updates
                await this.pollForCompletion(requestId);
                
            } else {
                this.updateUI('Failed to start course generation', 'error');
            }

        } catch (error) {
            this.updateUI(`Error: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Poll for course generation completion
     * @param {string} requestId - The request ID
     */
    async pollForCompletion(requestId) {
        const maxAttempts = 60; // 5 minutes with 5-second intervals
        let attempts = 0;

        const pollInterval = setInterval(async () => {
            attempts++;
            
            try {
                const statusResponse = await this.api.checkStatus(requestId);
                
                if (statusResponse.status === 'completed') {
                    clearInterval(pollInterval);
                    this.updateUI('Course generation completed!', 'success');
                    
                    // Get the generated course data
                    const courseData = await this.api.getGeneratedCourse(requestId);
                    this.handleCourseData(courseData);
                    
                } else if (statusResponse.status === 'failed') {
                    clearInterval(pollInterval);
                    this.updateUI('Course generation failed', 'error');
                    
                } else if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    this.updateUI('Course generation timed out', 'warning');
                } else {
                    this.updateUI(`Processing... (${attempts}/${maxAttempts})`, 'info');
                }
                
            } catch (error) {
                clearInterval(pollInterval);
                this.updateUI(`Status check error: ${error.message}`, 'error');
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Handle the generated course data
     * @param {Object} courseData - The generated course data
     */
    handleCourseData(courseData) {
        console.log('Generated course data:', courseData);
        
        // Here you can:
        // - Display the course information
        // - Navigate to the course page
        // - Show success message with course details
        // - Update the UI with course information
        
        this.updateUI(`Course "${courseData.course.title}" created successfully!`, 'success');
        
        // Example: Navigate to the course
        // window.location.href = `/courses/${courseData.course.id}`;
    }

    /**
     * Update the UI with status messages
     * @param {string} message - Status message
     * @param {string} type - Message type (info, success, error, warning)
     */
    updateUI(message, type) {
        // Implement your UI update logic here
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Example: Update a status element
        const statusElement = document.getElementById('generation-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-${type}`;
        }
    }
}

// Example HTML structure for the frontend
const htmlExample = `
<div class="course-generator">
    <h2>Generate Course from YouTube</h2>
    
    <div class="input-group">
        <label for="youtube-url">YouTube URL:</label>
        <input type="url" id="youtube-url" placeholder="https://www.youtube.com/watch?v=...">
    </div>
    
    <div class="input-group">
        <label for="timestamp">Timestamp:</label>
        <input type="text" id="timestamp" placeholder="00:05:30" readonly>
        <small>Auto-fetched from video</small>
    </div>
    
    <button id="generate-btn" onclick="generateCourse()">
        Generate Course Content
    </button>
    
    <div id="generation-status" class="status-info">
        Ready to generate course content
    </div>
</div>

<script>
// Initialize the course generator
const courseGenerator = new CourseGenerator();

// Example function to handle form submission
async function generateCourse() {
    const youtubeUrl = document.getElementById('youtube-url').value;
    const timestamp = document.getElementById('timestamp').value;
    
    if (!youtubeUrl) {
        alert('Please enter a YouTube URL');
        return;
    }
    
    if (!timestamp) {
        alert('Please wait for timestamp to be fetched');
        return;
    }
    
    await courseGenerator.handleCourseGeneration(youtubeUrl, timestamp);
}

// Example function to auto-fetch timestamp (implement based on your needs)
async function fetchTimestamp(youtubeUrl) {
    // This would be implemented based on your existing timestamp fetching logic
    // For now, we'll simulate it
    const timestampElement = document.getElementById('timestamp');
    timestampElement.value = '00:05:30'; // Simulated timestamp
}
</script>
`;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CourseGenerationAPI, CourseGenerator };
} 