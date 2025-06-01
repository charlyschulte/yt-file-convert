import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { spawn } from 'child_process';

export interface ConversionResult {
  input: string;
  output: string;
  success: boolean;
  error?: string;
  verified: boolean;
}

export class VideoConverter {
  private inputFolder: string;

  constructor(inputFolder: string) {
    this.inputFolder = inputFolder;
  }
  async convertVideos(): Promise<ConversionResult[]> {
    console.log(`Starting conversion process for folder: ${this.inputFolder}`);
    console.log('🔍 Scanning for .braw and .mov files (including subfolders)...');

    const files = await this.getAllVideoFiles();
    const results: ConversionResult[] = [];

    console.log(`\n📋 Found ${files.length} video file(s) to process:`);
    files.forEach(file => console.log(`  - ${file}`));

    if (files.length === 0) {
      console.log('\n⚠️  No .braw or .mov files found in the specified directory and its subfolders.');
      return results;
    }

    console.log('\n🎬 Starting conversion process...');

    for (const file of files) {
      console.log(`\nProcessing: ${file}`);

      try {
        const result = await this.processFile(file);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        results.push({
          input: file,
          output: '',
          success: false,
          error: error instanceof Error ? error.message : String(error),
          verified: false
        });
      }
    }

    this.printSummary(results);
    return results;
  }
  private async getAllVideoFiles(): Promise<string[]> {
    const files: string[] = [];
    await this.scanDirectory(this.inputFolder, files);
    return files;
  }

  private async scanDirectory(directory: string, files: string[]): Promise<void> {
    try {
      const entries = await readdir(directory);

      for (const entry of entries) {
        const fullPath = join(directory, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          console.log(`  📁 Scanning subfolder: ${fullPath}`);
          await this.scanDirectory(fullPath, files);
        } else if (stats.isFile()) {
          const ext = extname(entry).toLowerCase();
          if (ext === '.braw' || ext === '.mov') {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${directory}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async processFile(inputFile: string): Promise<ConversionResult> {
    const ext = extname(inputFile).toLowerCase();

    // For .braw files, convert directly
    if (ext === '.braw') {
      return await this.convertToMp4(inputFile);
    }

    // For .mov files, check if it's ProRes
    if (ext === '.mov') {
      const isProRes = await this.isProResFile(inputFile);
      if (isProRes) {
        console.log('  ✓ ProRes format detected');
        return await this.convertToMp4(inputFile);
      } else {
        console.log('  ⏭ Not ProRes format, skipping');
        return {
          input: inputFile,
          output: '',
          success: false,
          error: 'Not ProRes format',
          verified: false
        };
      }
    }

    throw new Error(`Unsupported file type: ${ext}`);
  }

  private async isProResFile(filePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_streams',
        filePath
      ]);

      let output = '';
      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffprobe failed with code ${code}`));
          return;
        }

        try {
          const info = JSON.parse(output);
          const videoStream = info.streams?.find((stream: any) => stream.codec_type === 'video');
          const codecName = videoStream?.codec_name?.toLowerCase() || '';

          // Check for ProRes codec variants
          const isProRes = codecName.includes('prores') || codecName.includes('prores_ks');
          resolve(isProRes);
        } catch (error) {
          reject(new Error(`Failed to parse ffprobe output: ${error}`));
        }
      });

      ffprobe.on('error', (error) => {
        reject(new Error(`ffprobe error: ${error.message}`));
      });
    });
  }

  private async convertToMp4(inputFile: string): Promise<ConversionResult> {
    const outputFile = this.generateOutputPath(inputFile);

    console.log(`  🔄 Converting to: ${basename(outputFile)}`);

    const success = await this.runFFmpeg(inputFile, outputFile);

    if (!success) {
      return {
        input: inputFile,
        output: outputFile,
        success: false,
        error: 'FFmpeg conversion failed',
        verified: false
      };
    }

    console.log('  ✓ Conversion completed');

    // Verify the output file
    const verified = await this.verifyMp4File(outputFile);

    if (verified) {
      console.log('  ✓ File verification passed');
    } else {
      console.log('  ✗ File verification failed');
    }

    return {
      input: inputFile,
      output: outputFile,
      success: true,
      verified
    };
  }

  private generateOutputPath(inputFile: string): string {
    // Keep files in the same folder as the original files
    const dir = dirname(inputFile);
    const name = basename(inputFile, extname(inputFile));
    return join(dir, `${name}.mp4`);
  } private async runFFmpeg(inputFile: string, outputFile: string): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputFile,
        '-c:v', 'libx264',          // H.264 video codec
        '-profile:v', 'high',       // Use High profile for better quality
        '-level', '4.1',            // Specify level for compatibility
        '-pix_fmt', 'yuv420p',      // Use 8-bit 4:2:0 format for maximum compatibility
        '-preset', 'slower',        // Slower preset for better quality/compression ratio
        '-crf', '18',              // Lower CRF for much higher quality (18 = visually lossless)
        '-maxrate', '50M',         // Maximum bitrate cap to prevent huge files
        '-bufsize', '100M',        // Buffer size for rate control
        '-c:a', 'aac',             // AAC audio codec
        '-profile:a', 'aac_low',    // Use AAC-LC profile
        '-b:a', '256k',            // Higher audio bitrate for better quality
        '-movflags', '+faststart', // Web optimization
        '-f', 'mp4',               // Explicitly specify MP4 format
        '-y',                      // Overwrite output file
        outputFile
      ]);

      ffmpeg.stdout.on('data', (data) => {
        // FFmpeg outputs to stderr, but we can capture stdout if needed
      });

      ffmpeg.stderr.on('data', (data) => {
        // You can uncomment this line to see FFmpeg progress
        // process.stdout.write(data.toString());
      });

      ffmpeg.on('close', (code) => {
        resolve(code === 0);
      });

      ffmpeg.on('error', (error) => {
        console.error(`FFmpeg error: ${error.message}`);
        resolve(false);
      });
    });
  }

  private async verifyMp4File(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-select_streams', 'v:0',
        '-count_packets',
        '-show_entries', 'stream=nb_read_packets',
        '-of', 'csv=p=0',
        filePath
      ]);

      let hasOutput = false;

      ffprobe.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output && parseInt(output) > 0) {
          hasOutput = true;
        }
      });

      ffprobe.on('close', (code) => {
        resolve(code === 0 && hasOutput);
      });

      ffprobe.on('error', () => {
        resolve(false);
      });
    });
  }

  private printSummary(results: ConversionResult[]): void {
    console.log('\n' + '='.repeat(50));
    console.log('CONVERSION SUMMARY');
    console.log('='.repeat(50));

    const successful = results.filter(r => r.success);
    const verified = results.filter(r => r.verified);
    const failed = results.filter(r => !r.success);

    console.log(`Total files processed: ${results.length}`);
    console.log(`Successfully converted: ${successful.length}`);
    console.log(`Verified as working: ${verified.length}`);
    console.log(`Failed conversions: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed files:');
      failed.forEach(f => {
        console.log(`  ✗ ${basename(f.input)}: ${f.error}`);
      });
    }

    if (successful.length > 0) {
      console.log('\nSuccessful conversions:');
      successful.forEach(f => {
        const status = f.verified ? '✓' : '⚠';
        console.log(`  ${status} ${basename(f.input)} → ${basename(f.output)}`);
      });
    }
  }
}
