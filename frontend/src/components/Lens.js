import React, { useState, useRef, useCallback } from 'react';
import './Lens.css';

const Lens = ({ 
  children, 
  zoomFactor = 2, 
  lensSize = 150,
  isStatic = false 
}) => {
  const [showLens, setShowLens] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !imageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Keep lens within bounds
    const boundedX = Math.max(lensSize / 2, Math.min(x, rect.width - lensSize / 2));
    const boundedY = Math.max(lensSize / 2, Math.min(y, rect.height - lensSize / 2));

    setPosition({ 
      x: boundedX, 
      y: boundedY,
      percentX: (x / rect.width) * 100,
      percentY: (y / rect.height) * 100
    });
  }, [lensSize]);

  const handleMouseEnter = useCallback(() => {
    setShowLens(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowLens(false);
  }, []);

  // Extract image src from children
  const imageSrc = React.Children.toArray(children).find(
    child => child.type === 'img'
  )?.props.src;

  return (
    <div 
      ref={containerRef}
      className="lens-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={imageRef} className="lens-content">
        {children}
      </div>
      
      {showLens && (
        <div 
          className="lens-magnifier"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${position.x}px`,
            top: `${position.y}px`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundPosition: `${position.percentX}% ${position.percentY}%`,
          }}
        />
      )}
    </div>
  );
};

export default Lens;
