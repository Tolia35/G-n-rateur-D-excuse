import React, { useState, useEffect } from 'react';
import JellySlider from './components/JellySlider';
import JellyButton from './components/JellyButton';
import { generateAbsurdExcuse } from './services/geminiService';

const App: React.FC = () => {
  const [absurdity, setAbsurdity] = useState<number>(50);
  const [excuse, setExcuse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [wobble, setWobble] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Basic check for API key presence
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  const handleGenerate = async () => {
    if (apiKeyMissing) return;

    setLoading(true);
    setWobble(false);
    
    setTimeout(async () => {
        try {
            const newExcuse = await generateAbsurdExcuse(absurdity, history);
            setExcuse(newExcuse);
            setHistory(prev => {
                const newHistory = [...prev, newExcuse];
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
            setWobble(true);
        } catch (error) {
            console.error(error);
            setExcuse("Oups, l'univers s'est contracté, réessaie !");
        } finally {
            setLoading(false);
        }
    }, 600);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Theme classes
  const bgClass = isDarkMode 
    ? "bg-slate-900" 
    : "bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100";
  
  const blobColors = isDarkMode 
    ? ["bg-purple-600", "bg-cyan-600", "bg-pink-600"] 
    : ["bg-yellow-300", "bg-pink-300", "bg-purple-300"];

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-between p-4 transition-colors duration-500 ${bgClass} selection:bg-purple-500 selection:text-white overflow-x-hidden`}>
      
      {/* Background blobs (Fixed so they don't scroll) */}
      <div className={`fixed -top-20 -left-20 w-96 h-96 ${blobColors[0]} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none transition-colors duration-500`}></div>
      <div className={`fixed top-1/2 -right-20 w-80 h-80 ${blobColors[1]} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700 pointer-events-none transition-colors duration-500`}></div>
      <div className={`fixed -bottom-20 left-1/3 w-96 h-96 ${blobColors[2]} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000 pointer-events-none transition-colors duration-500`}></div>

      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleTheme}
        className={`absolute top-4 right-4 z-50 p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${isDarkMode ? 'bg-white/10 border-white/20 text-yellow-300' : 'bg-white/40 border-white/50 text-slate-600'}`}
      >
        {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      <main className="relative z-10 w-full max-w-xl flex flex-col items-center flex-grow justify-center gap-6 py-8 md:py-12">
        
        {/* Header */}
        <header className="text-center mt-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 drop-shadow-sm tracking-tight leading-tight px-2">
                Le générateur d'alibis
            </h1>
        </header>

        {/* Error Banner */}
        {apiKeyMissing && (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-xs rounded w-full max-w-md animate-bounce mb-2" role="alert">
                <span className="font-bold">Erreur: </span> Clé API manquante.
            </div>
        )}

        {/* Controls Container */}
        <div className={`w-full ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/40 border-white/50'} backdrop-blur-md rounded-3xl p-6 shadow-xl border flex flex-col items-center transition-colors duration-500`}>
            
            {/* Slider */}
            <JellySlider 
                value={absurdity} 
                onChange={setAbsurdity} 
                disabled={loading}
                isDarkMode={isDarkMode}
            />

            {/* Action Area */}
            <div className="flex justify-center mt-6 pb-2">
                <JellyButton 
                    onClick={handleGenerate} 
                    loading={loading} 
                    label="Chercher une excuse"
                />
            </div>

        </div>

        {/* Result Display - Allows natural growth (no internal scroll) */}
        <div className="w-full flex items-center justify-center relative min-h-[120px]">
            {excuse && !loading && (
                <div 
                    className={`
                        relative p-8 rounded-2xl shadow-lg border-2 w-full
                        transform transition-all duration-500
                        ${wobble ? 'animate-jelly' : ''}
                        ${isDarkMode ? 'bg-slate-800 border-purple-500/50 text-white' : 'bg-white border-purple-200 text-gray-800'}
                    `}
                >
                    <div className="absolute -top-4 -left-2 text-4xl opacity-30 rotate-12 text-purple-400">❝</div>
                    <p className={`text-lg md:text-xl font-bold leading-relaxed text-center break-words whitespace-pre-wrap ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {excuse}
                    </p>
                    <div className="absolute -bottom-4 -right-2 text-4xl opacity-30 rotate-12 text-purple-400">❞</div>
                </div>
            )}
            
            {!excuse && !loading && !apiKeyMissing && (
                <div className={`italic text-sm animate-pulse text-center px-4 mt-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Tire sur le levier, Kronk !
                </div>
            )}
        </div>

      </main>

      {/* Footer */}
      <footer className={`relative z-10 py-4 text-[10px] text-center opacity-40 hover:opacity-80 transition-opacity ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Propulsé par Gemini 2.5 • Absurdité Garantie
      </footer>

    </div>
  );
};

export default App;