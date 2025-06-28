import { useState, useEffect } from 'react';

export default function OutputCard({ 
  thinkingUpdates, 
  finalDM, 
  metadata, 
  isGenerating 
}) {
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (finalDM) {
      setCharCount(finalDM.length);
    }
  }, [finalDM]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalDM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isGenerating && !finalDM) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Generation Process</h2>
      
      {/* AI Thinking Process */}
      {thinkingUpdates && thinkingUpdates.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-800 mb-2">🧠 AI Thinking Process:</h3>
          <div className="space-y-2">
            {thinkingUpdates.map((update, index) => (
              <div key={index} className="text-sm text-blue-700 flex items-center">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {update}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isGenerating && !finalDM && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Generating your personalized DM...</span>
        </div>
      )}

      {/* Final Generated DM */}
      {finalDM && (
        <>
          {/* Twitter Profile Context - WITH SAFE CHECKS */}
          {metadata?.twitterData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">📊 Profile Data Used:</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  metadata.twitterData.dataSource === 'Real Twitter Data' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {metadata.twitterData.dataSource || 'Mock Data'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {metadata.twitterData.display_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Followers:</span> {metadata.twitterData.followers_count?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {metadata.twitterData.location || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Verified:</span> {metadata.twitterData.verified ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Bio:</span> {metadata.twitterData.bio || 'No bio available'}
              </p>
              
              {/* SAFE RECENT TWEETS RENDERING */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Recent Tweets ({metadata.twitterData.recent_tweets?.length || 0}):</span>
                {metadata.twitterData.recent_tweets && Array.isArray(metadata.twitterData.recent_tweets) && metadata.twitterData.recent_tweets.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {metadata.twitterData.recent_tweets.map((tweet, index) => (
                      <li key={index} className="text-xs bg-white p-2 rounded border-l-2 border-blue-200">
                        "{tweet.text || 'No text available'}" 
                        <span className="text-gray-400 ml-2">
                          ({tweet.likes || 0} ❤️, {tweet.retweets || 0} 🔄)
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">No recent tweets available</p>
                )}
              </div>
            </div>
          )}

          {/* Generated DM */}
          <div className="border-l-4 border-green-500 pl-4 mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-700">✨ Generated Cold DM:</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                charCount <= 280 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {charCount}/280 chars
              </span>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed italic bg-gray-50 p-3 rounded">
              "{finalDM}"
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy DM'}
            </button>
            
            <button
              onClick={() => window.open('https://twitter.com/messages/compose', '_blank')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
            >
              🐦 Open Twitter DMs
            </button>
          </div>
        </>
      )}
    </div>
  );
}
