import { fetchCourseDetails, type Course, type Module, type Class } from '@/lib/services/course.service';
import Image from 'next/image';
import Link from 'next/link';
import PurchaseButton from './PurchaseButton'; // Import the new client component

// Helper to format price (can be moved to a utils file if used elsewhere)
const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return 'N/A';
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
};

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id: courseId } = params;
  const { success, course, message, error } = await fetchCourseDetails(courseId);

  if (!success || !course) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-red-700">Course Not Found</h1>
        <p className="mt-4 text-lg text-gray-600">
          {message || `We couldn't find the course you're looking for (ID: ${courseId}).`}
        </p>
        {error && <p className="mt-2 text-sm text-gray-500">Details: {JSON.stringify(error.details || error.message)}</p>}
        <Link href="/courses" legacyBehavior>
          <a className="mt-8 inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Back to Courses
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden md:flex mb-12">
          {course.image_url && (
            <div className="md:w-1/3 relative h-64 md:h-auto">
              <Image
                src={course.image_url}
                alt={`Cover image for ${course.title}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
          <div className={`p-8 ${course.image_url ? 'md:w-2/3' : 'w-full'}`}>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{course.title}</h1>
            {course.instructor_name && (
              <p className="text-lg text-gray-600 mb-4">
                By <span className="font-semibold text-indigo-600">{course.instructor_name}</span>
              </p>
            )}
            {course.description && (
              <p className="text-gray-700 text-base mb-6 leading-relaxed">
                {course.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
              <p className="text-3xl font-bold text-indigo-700 mb-4 sm:mb-0">
                {formatPrice(course.price)}
              </p>
              <div className="w-full sm:w-auto">
                <PurchaseButton 
                  courseId={course.id} 
                  courseTitle={course.title} 
                  price={course.price} 
                />
              </div>
            </div>
             <p className="text-xs text-gray-500 mt-4">Created: {new Date(course.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Course Content - Modules and Classes */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Course Content</h2>
          {course.modules && course.modules.length > 0 ? (
            <div className="space-y-8">
              {course.modules.map((module: Module) => (
                <div key={module.id} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                  <h3 className="text-2xl font-semibold text-indigo-700 mb-4">{module.title}</h3>
                  {module.description && (
                    <p className="text-gray-600 mb-4 text-sm">{module.description}</p>
                  )}
                  {module.classes && module.classes.length > 0 ? (
                    <ul className="space-y-3 list-disc list-inside pl-4">
                      {module.classes.map((cls: Class) => (
                        <li key={cls.id} className="text-gray-700 hover:text-indigo-500 transition-colors">
                          {cls.title}
                          {/* Link to individual class page could be: /courses/[courseId]/class/[classId] */}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No classes in this module yet.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-lg text-gray-600">No modules available for this course yet. Content coming soon!</p>
          )}
        </div>
         <div className="mt-12 text-center">
            <Link href="/courses" legacyBehavior>
                <a className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to All Courses
                </a>
            </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
