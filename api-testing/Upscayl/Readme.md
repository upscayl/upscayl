# Upscayl Cloud API - Requestly Collection

Test the Upscayl Cloud API endpoints using Requestly for seamless AI image upscaling integration.

## About Requestly

[Requestly](https://requestly.com) is an API testing tool chosen for this collection because it's Git-friendly, requires no login, and offers local storage options. This makes it perfect for version-controlled API testing that developers can clone and use immediately.

<img width="1440" height="900" alt="API Testing" src="https://github.com/user-attachments/assets/78e659ff-ed35-4185-aa3b-ade597002240" />

## API Endpoints Covered

This collection includes 4 Upscayl Cloud API endpoints:

### 1. Get Upload URL (`POST /get-upload-url`)
Generates secure upload URLs for image files before processing.

### 2. Complete Multipart Upload (`POST /complete-multipart-upload`)
Finalizes multipart file uploads to cloud storage.

### 3. Start Upscaling Task (`POST /start-task`) 
Initiates the AI upscaling process with model selection, scale factor, output format, and enhancement options.

### 4. Get Task Status (`POST /get-task-status`)
Monitors the progress of upscaling tasks and retrieves download links when complete.

## Getting Started

### Prerequisites
- [Requestly Desktop App](https://requestly.com/desktop) or Browser Extension
- Upscayl API key from https://upscayl.org/account/api-keys

### Step 1: Clone Repository
```bash
git clone https://github.com/upscayl/upscayl.git
cd upscayl/api-collection
```

### Step 2: Configure Variables
1. Open Requestly and navigate to the auto-imported collection
2. Go to **Collections** > **Upscayl API Testing** > **Variables**
3. Update the following values:
   ```
   baseUrl: https://api.upscayl.org
   x-api-key: YOUR_ACTUAL_API_KEY_HERE
   ```

### Step 3: Start Testing
The collection is ready to use - no import needed! Test the endpoints directly:
1. **Upload Workflow**: Use "Get Upload URL" → "Complete Multipart Upload" for large files
2. **Direct Upload**: Use "Start Upscaling Task" with file picker for immediate processing  
3. **Monitor Progress**: Use "Get Task Status" to check processing status

