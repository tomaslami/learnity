import { createClient } from '@/lib/supabase/client'; // Assuming client.ts is for both client and server-side in actions/server components

// Define a type for the expected shape of a course preview from the DB view
export interface PublicCoursePreview {
  id: string; // Typically UUID
  title: string;
  description: string | null;
  instructor_name: string | null;
  price: number | null;
  image_url: string | null;
  // Add any other relevant fields from your public_course_preview view
}

export async function getPublicCoursePreviews(): Promise<{
  data: PublicCoursePreview[] | null;
  error: { message: string; details?: any } | null;
}> {
  const supabase = createClient();

  const { data, error: dbError } = await supabase
    .from('public_course_preview') // Name of your Supabase view
    .select(`
      id,
      title,
      description,
      instructor_name,
      price,
      image_url
    `); // Adjust columns as per your view's schema

  if (dbError) {
    console.error('Supabase error fetching public_course_preview:', dbError);
    return { data: null, error: { message: dbError.message, details: dbError } };
  }

  return { data: data as PublicCoursePreview[], error: null };
}

// --- Interfaces for Course Details ---
export interface Class {
  id: string;
  title: string;
  content: string | null; // Or specific type if known
  video_url: string | null;
  module_id: string; // Foreign key
  created_at: string;
  // Add other class-specific fields
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  course_id: string; // Foreign key
  created_at: string;
  classes: Class[]; // Nested classes
  // Add other module-specific fields
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null; // Assuming this might come from a join or is denormalized
  price: number | null;
  image_url: string | null;
  created_at: string;
  // user_id: string; // Instructor/creator ID
  modules: Module[]; // Nested modules
  // Add other course-specific fields like category, tags, etc.
}

// --- Function to get full course details ---
export async function getCourseDetailsById(courseId: string): Promise<{
  data: Course | null;
  error: { message: string; details?: any } | null;
}> {
  const supabase = createClient();

  // Fetch course with related modules and classes
  // Adjust the select query based on your actual table structure and relationships
  // This assumes 'modules' has a foreign key 'course_id' to 'courses.id'
  // And 'classes' has a foreign key 'module_id' to 'modules.id'
  const { data, error: dbError } = await supabase
    .from('courses') // Main table is 'courses'
    .select(`
      id,
      title,
      description,
      instructor_name, 
      price,
      image_url,
      created_at,
      modules (
        id,
        title,
        description,
        course_id,
        created_at,
        classes (
          id,
          title,
          content,
          video_url,
          module_id,
          created_at
        )
      )
    `)
    .eq('id', courseId)
    .single(); // Use .single() if 'id' is unique and you expect one row

  if (dbError) {
    console.error(`Supabase error fetching course details for ID ${courseId}:`, dbError);
    const userMessage = dbError.code === 'PGRST116' // "Failed to parse response payload" often means not found for .single()
      ? `Course with ID ${courseId} not found.`
      : dbError.message;
    return { data: null, error: { message: userMessage, details: dbError } };
  }

  return { data: data as Course, error: null };
}
