import { fetchPublicCoursePreviews, type PublicCoursePreview } from '@/lib/services/course.service';
import Image from 'next/image';
import Link from 'next/link';

// Helper to format price (optional)
const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return 'N/A';
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
};

async function CoursesPage() {
  const { success, courses, message, error } = await fetchPublicCoursePreviews();

  if (!success) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Error Fetching Courses</h1>
        <p className="mt-4 text-lg text-gray-700">{message || 'An unexpected error occurred.'}</p>
        {error && <p className="mt-2 text-sm text-gray-500">Details: {JSON.stringify(error.details || error.message)}</p>}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">No Courses Available</h1>
        <p className="mt-4 text-lg text-gray-700">Please check back later, we are working on adding new courses!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Explore Our Courses
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course: PublicCoursePreview) => (
            <Link href={`/courses/${course.id}`} key={course.id} legacyBehavior>
              <a className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                <div className="relative w-full h-56">
                  {course.image_url ? (
                    <Image
                      src={course.image_url}
                      alt={`Cover image for ${course.title}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 truncate">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                      {course.description}
                    </p>
                  )}
                  {course.instructor_name && (
                    <p className="text-gray-500 mt-3 text-xs font-medium">
                      Instructor: <span className="font-semibold text-gray-700">{course.instructor_name}</span>
                    </p>
                  )}
                  <div className="mt-4">
                    <span className="text-xl font-semibold text-indigo-600">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                   <div className="mt-5 text-right">
                      <span className="text-sm font-medium text-indigo-500 group-hover:text-indigo-700 transition-colors duration-300">
                        View Details &rarr;
                      </span>
                    </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;
