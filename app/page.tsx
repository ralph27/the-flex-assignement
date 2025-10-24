import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Flex Living
          </h1>
          <p className="text-2xl text-gray-600">Reviews Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/dashboard"
            className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Manager Dashboard
            </h2>
            <p className="text-gray-600">
              View, filter, and manage all guest reviews. Approve reviews for
              public display and track performance metrics.
            </p>
          </Link>

          <Link
            href="/property/2b-n1-a-29-shoreditch-heights"
            className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Property Page
            </h2>
            <p className="text-gray-600">
              See how approved reviews are displayed on public property pages
              for potential guests.
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">
                Hostaway API integration with mock data fallback
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">
                Advanced filtering by property, channel, rating, and date
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">
                Review approval system for public display
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">
                Performance analytics and trend charts
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">
                Google Places API integration ready
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}