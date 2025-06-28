import { useState } from 'react';
import InputForm from './components/InputForm';
import OutputCard from './components/OutputCard';

function App() {
  const [thinkingUpdates, setThinkingUpdates] = useState([]);
  const [finalDM, setFinalDM] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartGeneration = async (handle, motive) => {
    // Reset state
    setThinkingUpdates([]);
    setFinalDM('');
    setMetadata(null);
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:5000/api/personalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle, motive })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setIsGenerating(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'thinking_update') {
                setThinkingUpdates(prev => [...prev, parsed.content]);
              } else if (parsed.type === 'final_response') {
                setFinalDM(parsed.content);
              } else if (parsed.type === 'metadata') {
                setMetadata(parsed.content);
              } else if (parsed.type === 'error') {
                throw new Error(parsed.content);
              }
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Cold DM Personalizer
          </h1>
          <p className="text-gray-600 text-lg">
            Generate personalized cold DMs for Twitter founders using real-time AI
          </p>
          <div className="flex justify-center items-center mt-4 text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
              Powered by Alchemyst AI
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Real-time Streaming
            </span>
          </div>
        </div>

        {/* Main Content */}
        <InputForm onStartGeneration={handleStartGeneration} />
        
        <OutputCard 
          thinkingUpdates={thinkingUpdates}
          finalDM={finalDM}
          metadata={metadata}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}

export default App;
