/**
 * Video validation utilities for uploads
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_VIDEO_DURATION = 5 * 60; // 5 minutes
const MIN_VIDEO_DURATION = 10; // 10 seconds

const ALLOWED_VIDEO_TYPES = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];

/**
 * Validate video file
 */
export function validateVideoFile(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    errors.push(
      `Unsupported video format. Please use WebM, MP4, MOV, or AVI. You uploaded: ${file.type || 'unknown'}`
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of 100MB`
    );
  }

  // Warn if file size is large
  if (file.size > 50 * 1024 * 1024) {
    warnings.push('File size is large; upload may take longer');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract video duration from a video blob
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const fileURL = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(fileURL);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(fileURL);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = fileURL;
  });
}

/**
 * Validate video duration
 */
export async function validateVideoDuration(file: File): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const duration = await getVideoDuration(file);

    if (duration < MIN_VIDEO_DURATION) {
      errors.push(
        `Video is too short (${Math.round(duration)}s). Minimum duration is 10 seconds.`
      );
    }

    if (duration > MAX_VIDEO_DURATION) {
      errors.push(
        `Video is too long (${Math.round(duration)}s). Maximum duration is 5 minutes.`
      );
    }

    if (duration > 4 * 60) {
      warnings.push('Video is close to the 5-minute limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        'Could not validate video duration. Please check your file and try again.',
      ],
      warnings: [],
    };
  }
}

/**
 * Comprehensive video validation
 */
export async function validateVideo(file: File): Promise<ValidationResult> {
  // First validate file properties
  const fileValidation = validateVideoFile(file);
  if (!fileValidation.isValid) {
    return fileValidation;
  }

  // Then validate duration
  const durationValidation = await validateVideoDuration(file);

  return {
    isValid: durationValidation.isValid,
    errors: [...fileValidation.errors, ...durationValidation.errors],
    warnings: [...fileValidation.warnings, ...durationValidation.warnings],
  };
}

/**
 * Format validation error message for display
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.map((e, i) => `${i + 1}. ${e}`).join('\n');
}

/**
 * Format validation warnings for display
 */
export function formatValidationWarnings(warnings: string[]): string {
  if (warnings.length === 0) return '';
  if (warnings.length === 1) return warnings[0];
  return warnings.map((w, i) => `${i + 1}. ${w}`).join('\n');
}
