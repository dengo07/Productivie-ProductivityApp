import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Circle, Ruler, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

const DraggableComponent = React.memo(({ component, children, onRemove, onUpdate, isSelected, onSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const animationFrameRef = useRef(null);

  const throttledUpdate = useCallback((id, updates) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      onUpdate(id, updates);
      animationFrameRef.current = null;
    });
  }, [onUpdate]);

  const handleDrag = useCallback((e, d) => {
    throttledUpdate(component.id, { x: d.x, y: d.y });
  }, [component.id, throttledUpdate]);

  const handleResize = useCallback((e, direction, ref, delta, position) => {
    throttledUpdate(component.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [component.id, throttledUpdate]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) onSelect(component.id);
  }, [component.id, onSelect, isDragging, isResizing]);

  const containerStyle = useMemo(() => ({
    transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
    transform: `translateZ(0) ${isSelected ? 'scale(1.01)' : 'scale(1)'}`,
  }), [isDragging, isResizing, isSelected]);

  useEffect(() => () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  return (
    <Rnd
      size={{ width: component.width, height: component.height }}
      position={{ x: component.x, y: component.y }}
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragStop={() => setIsDragging(false)}
      onResizeStart={() => setIsResizing(true)}
      onResize={handleResize}
      onResizeStop={() => setIsResizing(false)}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      bounds="parent"
      minWidth={250}
      minHeight={180}
      dragHandleClassName="drag-handle"
      cancel=".rnd-cancel-drag" // Bu sınıf sürüklemeyi iptal eder
      enableResizing={{ bottomRight: true }}
      resizeHandleStyles={{
        bottomRight: {
          width: '12px',
          height: '12px',
          background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #64748b 40%, #64748b 60%, transparent 60%)',
          cursor: 'nw-resize',
        }
      }}
      style={containerStyle}
    >
      <div
        onClick={handleClick}
        className={`relative w-full h-full rounded-xl shadow-lg border transition-all duration-200 overflow-hidden ${
          isSelected 
            ? 'ring-2 ring-primary border-primary bg-base-100 shadow-xl' 
            : 'border-base-300 bg-base-100 hover:shadow-xl hover:border-base-400'
        }`}
      >
        {/* Header */}
        <div className="drag-handle flex items-center justify-between p-0 sm:p-1 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-200 cursor-move relative z-10">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Circle className="w-2 h-2 text-primary opacity-60 fill-current flex-shrink-0" />
            <h2 className="text-sm sm:text-lg font-semibold text-base-content truncate">
              {component.title}
            </h2>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(component.id, { 
                  width: component.width === 300 ? 400 : 300,
                  height: component.height === 250 ? 350 : 250 
                });
              }}
              
              className="rnd-cancel-drag btn btn-xs btn-ghost hover:btn-primary transition-colors"
              title="Toggle size"
            >
              <Ruler className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(component.id);
              }}
              
              className="rnd-cancel-drag btn btn-xs btn-ghost hover:btn-primary transition-colors"
              title={`Remove ${component.title}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 h-[calc(100%-2.25rem)] sm:h-[calc(100%-2.5rem)] overflow-auto custom-scrollbar">
          {children}
        </div>

        {/* Resize indicator */}
        <div className="absolute bottom-0 right-0 w-4 h-4 opacity-40 pointer-events-none">
          <svg viewBox="0 0 12 12" className="w-full h-full text-base-content">
            <path d="M12 12L8 12L12 8Z" fill="currentColor" opacity="0.3"/>
            <path d="M12 12L4 12L12 4Z" fill="currentColor" opacity="0.2"/>
          </svg>
        </div>
      </div>
    </Rnd>
  );
});

DraggableComponent.displayName = 'DraggableComponent';

export default DraggableComponent;