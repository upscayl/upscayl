const fs = require('fs');
const path = require('path');

// Function to sanitize filename
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

// Function to check if filename is a UUID
function isUUID(filename) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const nameWithoutExt = path.parse(filename).name;
  return uuidRegex.test(nameWithoutExt);
}

// Function to rename files in a directory
function renameFilesInDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      renameFilesInDirectory(filePath);
    } else if (file.endsWith('.json') && isUUID(file)) {
      try {
        // Read and parse JSON file
        const content = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(content);
        
        if (jsonData.name) {
          // Generate new filename
          const sanitizedName = sanitizeFilename(jsonData.name);
          const newFilename = `${sanitizedName}.json`;
          const newFilePath = path.join(dirPath, newFilename);
          
          // Check if new filename already exists
          if (fs.existsSync(newFilePath)) {
            console.log(`⚠️  Skipping ${file} - ${newFilename} already exists`);
            return;
          }
          
          // Rename the file
          fs.renameSync(filePath, newFilePath);
          console.log(`✅ Renamed: ${file} → ${newFilename}`);
        } else {
          console.log(`⚠️  No 'name' field found in ${file}`);
        }
      } catch (error) {
        console.log(`❌ Error processing ${file}:`, error.message);
      }
    }
  });
}

// Main execution
function main() {
  const rootDir = process.cwd(); // Current directory
  
  console.log('🔄 Starting file rename process...');
  console.log(`📁 Processing directory: ${rootDir}`);
  
  renameFilesInDirectory(rootDir);
  
  console.log('✨ File rename process completed!');
}

// Run the script
main();
