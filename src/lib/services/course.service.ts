import { getPublicCoursePreviews, type PublicCoursePreview } from '@/lib/repository/course.repository';

export async function fetchPublicCoursePreviews(): Promise<{
  success: boolean;
  courses?: PublicCoursePreview[];
  message?: string;
  error?: { message: string; details?: any };
}> {
  console.log('fetchPublicCoursePreviews service called');

  try {
    const response = await getPublicCoursePreviews();

    if (response.error) {
      console.error('Error from getPublicCoursePreviews repository:', response.error);
      return {
        success: false,
        message: `Failed to fetch courses: ${response.error.message}`,
        error: response.error,
      };
    }

    if (response.data) {
      return {
        success: true,
        courses: response.data,
      };
    }

    // Fallback for unexpected cases where data might be missing without an error
    return {
      success: false,
      message: 'Failed to fetch courses due to an unexpected issue. No data returned.',
      error: { message: 'No data returned from repository without explicit error.' },
    };

  } catch (e) {
    console.error('Unexpected error in fetchPublicCoursePreviews service:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred while fetching courses: ${errorMessage}`,
      error: { message: `Unexpected error: ${errorMessage}`, details: e },
    };
  }
}

export async function fetchCourseDetails(courseId: string): Promise<{
  success: boolean;
  course?: Course; // Using the Course interface from repository
  message?: string;
  error?: { message: string; details?: any };
}> {
  console.log(`fetchCourseDetails service called for courseId: ${courseId}`);

  if (!courseId) {
    return {
      success: false,
      message: 'Course ID is required.',
      error: { message: 'Course ID cannot be empty.' },
    };
  }

  try {
    const response = await getCourseDetailsById(courseId);

    if (response.error) {
      console.error(`Error from getCourseDetailsById repository for ID ${courseId}:`, response.error);
      const userMessage = response.error.message.includes('not found')
        ? `Course with ID ${courseId} not found.`
        : `Failed to fetch course details: ${response.error.message}`;
      return {
        success: false,
        message: userMessage,
        error: response.error,
      };
    }

    if (response.data) {
      return {
        success: true,
        course: response.data,
      };
    }

    // Fallback for unexpected cases where data might be missing without an error
    return {
      success: false,
      message: `Course with ID ${courseId} not found or data is invalid.`,
      error: { message: 'No data returned from repository without explicit error.' },
    };

  } catch (e) {
    console.error(`Unexpected error in fetchCourseDetails service for ID ${courseId}:`, e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      success: false,
      message: `An unexpected error occurred while fetching course details: ${errorMessage}`,
      error: { message: `Unexpected error: ${errorMessage}`, details: e },
    };
  }
}
