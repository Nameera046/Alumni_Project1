import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getScreenComponent, getScreenIdByName } from '../utils/screenMap';

const DynamicScreen = () => {
  const { screenId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  
  // Handle both numeric IDs and string names (e.g., webinar-dashboard)
  let numericScreenId = null;
  if (screenId) {
    const parsed = parseInt(screenId, 10);
    if (!isNaN(parsed)) {
      numericScreenId = parsed;
    } else {
      // Try name-to-ID mapping
      numericScreenId = getScreenIdByName(screenId);
    }
  }
  
  const ScreenComponent = numericScreenId ? getScreenComponent(numericScreenId) : null;
  
  if (ScreenComponent) {
    // Render the screen component with props
    const props = {
      screenId: numericScreenId,
      email: emailParam,
      originalPath: screenId, // Pass original for potential use
      // Add more common props as needed
    };
    return React.createElement(ScreenComponent, props);
  }

  // Fallback for unauthorized/invalid screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/50">
        <div className="text-8xl mb-8 mx-auto">🔒</div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
          Access Required
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
          Screen <code className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-mono">{screenId || 'unknown'}</code>{' '}
          requires authorized role-based access.
        </p>
        <button 
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        <p className="mt-8 text-sm text-gray-500">
          Contact admin for screen access.
        </p>
      </div>
    </div>
  );
};

export default DynamicScreen;

