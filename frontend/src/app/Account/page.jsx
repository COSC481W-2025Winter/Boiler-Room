'use client';
import { useState } from 'react';
import './Account.css'; // import the CSS file

export default function Account() {
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <div>
        {/* User Profile Section */}
        <div className="max-w-4xl mx-auto mt-6 px-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 p-3 rounded-full">AV</div>
            <div>
              <h2 className="text-xl font-semibold">Username</h2>
              <p className="text-gray-400">Steamname</p>
            </div>
            {!isEditing && (
              <button 
                className="ml-auto bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setIsEditing(true)}
              >
                Edit Mode
              </button>
            )}
          </div>
          <textarea
            className="w-full bg-gray-800 text-white mt-4 p-3 rounded"
            placeholder="Bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Game Recommendations */}
        <div className="max-w-4xl mx-auto mt-6 px-6">
          {['Category 1', 'Category 2'].map((category) => (
            <div key={category} className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Game Recs {category}</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((game) => (
                  <div 
                    key={game} 
                    className="bg-gray-800 rounded-lg hover:bg-gray-700 transition p-4 text-center text-white"
                  >
                    Game {game}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Changes Button */}
      {isEditing && (
        <div className="w-full flex justify-center p-6">
          <button 
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
            onClick={() => setIsEditing(false)}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}