import React from 'react';

interface JellyButtonProps {
  onClick: () => void;
  loading: boolean;
  label: string;
}

const JellyButton: React.FC<JellyButtonProps> = ({ onClick, loading, label }) => {
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [ripples, setRipples] = React.useState<{x: number, y: number, id: number}[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
        setRipples((prev) => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    onClick();
  };

  return (
    <div className="relative inline-block group" style={{ filter: "url('#goo')" }}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
            relative z-10 px-8 py-4 
            text-lg font-bold text-white 
            bg-purple-600 rounded-full 
            transform transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
            hover:scale-105 active:scale-95 hover:bg-purple-500
            disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
            shadow-lg hover:shadow-xl hover:shadow-purple-400/50
            overflow-hidden
        `}
      >
        <span className="relative z-20 flex items-center gap-2">
            {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </>
            ) : label}
        </span>
        
        {/* Ripples */}
        {ripples.map((ripple) => (
            <span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
                style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)'
                }}
            />
        ))}
      </button>

      {/* Decorative blobs for goo effect on hover - Reduced size/distance */}
      <div className="absolute top-0 left-1/4 w-6 h-6 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:-translate-y-5 animate-bounce delay-75"></div>
      <div className="absolute bottom-0 right-1/4 w-5 h-5 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-5 animate-bounce delay-100"></div>
    </div>
  );
};

export default JellyButton;