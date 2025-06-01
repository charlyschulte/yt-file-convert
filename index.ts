// Configuration
const DEFAULT_INPUT_FOLDER = './videos'; // Change this to your default input folder

import { VideoConverter } from './VideoConverter.js';

// Main execution
async function main() {
    const args = process.argv.slice(2);

    // Use command line argument or default folder
    const inputFolder = args[0] || DEFAULT_INPUT_FOLDER;

    console.log(`Input folder: ${inputFolder}`);

    try {
        const converter = new VideoConverter(inputFolder);
        await converter.convertVideos();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Check if this script is being run directly
if (import.meta.main) {
    main();
}