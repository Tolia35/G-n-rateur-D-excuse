import React, { useRef, useState, useEffect, useCallback } from 'react';

interface JellySliderProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  isDarkMode?: boolean;
}

const JellySlider: React.FC<JellySliderProps> = ({ value, onChange, disabled, isDarkMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics state
  const state = useRef({
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    isDragging: false,
    dragOffset: { x: 0, y: 0 } 
  });

  const [displayValue, setDisplayValue] = useState(value);

  // Constants for physics
  const SPRING = 0.2; 
  const DAMPING = 0.6; 
  const MAX_STRETCH_Y = 120; 

  useEffect(() => {
    if (!state.current.isDragging && containerRef.current) {
        const width = containerRef.current.clientWidth;
        state.current.target.x = (value / 100) * width;
        if (state.current.pos.x === 0 && value !== 0) {
            state.current.pos.x = state.current.target.x;
        }
    }
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const s = state.current;
      
      const dx = s.target.x - s.pos.x;
      const ax = dx * SPRING;
      s.vel.x += ax;
      s.vel.x *= DAMPING;
      s.pos.x += s.vel.x;

      const dy = s.target.y - s.pos.y;
      const ay = dy * SPRING;
      s.vel.y += ay;
      s.vel.y *= DAMPING;
      s.pos.y += s.vel.y;

      if (containerRef.current) {
        const handleGroup = containerRef.current.querySelector('#jelly-handle-group') as SVGGElement;
        const handleShape = containerRef.current.querySelector('#jelly-handle-shape') as SVGCircleElement;
        const connection = containerRef.current.querySelector('#jelly-connection') as SVGPathElement;
        
        if (handleGroup) {
            handleGroup.setAttribute('transform', `translate(${s.pos.x}, ${s.pos.y})`);
        }

        if (handleShape) {
            const velocity = Math.sqrt(s.vel.x**2 + s.vel.y**2);
            const stretch = Math.min(velocity * 0.04, 0.6); 
            const angle = Math.atan2(s.vel.y, s.vel.x) * (180 / Math.PI);
            handleShape.setAttribute('transform', `rotate(${angle}) scale(${1 + stretch}, ${1 - stretch * 0.6})`);
        }

        if (connection) {
            const d = `M 0 0 L ${s.pos.x} ${s.pos.y}`;
            connection.setAttribute('d', d);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || !containerRef.current) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    state.current.isDragging = true;
    updateTarget(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!state.current.isDragging) return;
    updateTarget(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    state.current.isDragging = false;
    state.current.target.y = 0; 
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const updateTarget = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    
    const centerY = rect.top + rect.height / 2;
    let y = clientY - centerY;
    y = Math.max(-MAX_STRETCH_Y, Math.min(y, MAX_STRETCH_Y));
    
    state.current.target.x = x;
    state.current.target.y = y;

    const percent = Math.round((x / rect.width) * 100);
    onChange(percent);
  };

  // Dynamic Color
  const getColorClass = () => {
    if (displayValue < 33) return '#06b6d4'; // cyan-500
    if (displayValue < 66) return '#84cc16'; // lime-500
    return '#ec4899'; // pink-500
  };
  
  const currentColor = getColorClass();

  return (
    <div className="w-full max-w-lg mx-auto my-2 relative select-none touch-none">
        
      {/* Labels - Compact, Removed "?" */}
      <div className={`flex justify-between mb-3 font-bold text-[10px] uppercase tracking-widest transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        <span>Sur un malentendu</span>
        <span>Ça ne passera jamais</span>
      </div>

      {/* Interaction Area */}
      <div 
        ref={containerRef}
        className="relative h-14 w-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        
        {/* SVG Layer */}
        <svg 
            className="absolute top-1/2 left-0 w-full h-[300px] -translate-y-1/2 overflow-visible pointer-events-none"
            style={{ filter: "url('#goo')" }}
        >
            <g transform="translate(0, 150)"> {/* Center vertically */}
                
                {/* Background Track */}
                <line 
                    x1="0" y1="0" x2="100%" y2="0" 
                    stroke={isDarkMode ? "#334155" : "#e5e7eb"} 
                    strokeWidth="16" 
                    strokeLinecap="round" 
                    className="transition-colors duration-500"
                />

                {/* Active Liquid Connection */}
                <path 
                    id="jelly-connection"
                    d="M0,0 L0,0"
                    stroke={currentColor}
                    strokeWidth="16"
                    strokeLinecap="round"
                    fill="none"
                    className="transition-colors duration-300"
                    style={isDarkMode ? { filter: `drop-shadow(0 0 8px ${currentColor})` } : {}}
                />

                {/* Handle Group */}
                <g id="jelly-handle-group">
                    <circle 
                        id="jelly-handle-shape"
                        r="20" 
                        fill={currentColor}
                        className="transition-colors duration-300"
                        style={isDarkMode ? { filter: `drop-shadow(0 0 12px ${currentColor})` } : {}}
                    />
                    <circle r="6" fill="white" opacity="0.6" cx="-6" cy="-6" pointerEvents="none" />
                </g>

            </g>
        </svg>

      </div>

      {/* Value Display - Reduced size */}
      <div 
        className="text-center mt-2 text-3xl font-black transition-all duration-300"
        style={{ 
            color: currentColor,
            textShadow: isDarkMode ? `0 0 15px ${currentColor}` : 'none'
        }}
      >
        {displayValue}%
      </div>
      <div className={`text-center text-[10px] mt-1 font-medium transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Choisis ton niveau d'absurdité
      </div>

    </div>
  );
};

export default JellySlider;