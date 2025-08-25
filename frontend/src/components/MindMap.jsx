import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Brain, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  FolderOpen, 
  Save, 
  Target, 
  FileText, 
  Edit3, 
  Link, 
  X, 
  Plus 
} from 'lucide-react';

// Custom hooks for better separation of concerns
const useViewport = () => {
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const canvasRef = useRef(null);

  const screenToCanvas = useCallback(({ x, y }) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (x - rect.left - view.x) / view.scale,
      y: (y - rect.top - view.y) / view.scale,
    };
  }, [view]);

  const zoom = useCallback((delta, center) => {
    const factor = delta > 0 ? 1.1 : 1 / 1.1;
    const newScale = Math.max(0.2, Math.min(3, view.scale * factor));
    const { x, y } = screenToCanvas(center);

    setView(prev => ({
      scale: newScale,
      x: prev.x - (x * newScale - x * prev.scale),
      y: prev.y - (y * newScale - y * prev.scale),
    }));
  }, [view.scale, screenToCanvas]);

  const pan = useCallback((dx, dy) => {
    setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const reset = useCallback(() => {
    setView({ x: 0, y: 0, scale: 1 });
  }, []);

  return { view, setView, canvasRef, screenToCanvas, zoom, pan, reset };
};

const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);

  const select = useCallback((id, multi = false) => {
    setSelectedIds(prev => {
      if (multi) return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      return [id];
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
    setConnectingFrom(null);
  }, []);

  return { selectedIds, connectingFrom, setConnectingFrom, select, clear };
};

// Simplified Connection component
const Connection = ({ from, to, isSelected }) => {
  if (!from || !to) return null;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const offsetX = Math.min(Math.abs(dx), 200) * 0.6;
  const offsetY = Math.min(Math.abs(dy), 200) * 0.6;

  const controlPoint1 = { x: from.x + offsetX, y: from.y + offsetY };
  const controlPoint2 = { x: to.x - offsetX, y: to.y - offsetY };

  return (
    <path
      d={`M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`}
      className={`transition-all duration-200 fill-none ${
        isSelected ? 'stroke-primary stroke-[3px]' : 'stroke-rose-300 stroke-2 hover:stroke-primary/60'
      }`}
    />
  );
};

// Simplified Node component
const Node = ({ node, isSelected, isConnecting, onAction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.text);
  
  // Update internal text state if the node prop changes from outside
  useEffect(() => {
    setText(node.text);
  }, [node.text]);

  const nodeStyles = {
    root: 'bg-primary text-primary-content border-primary scale-105',
    main: 'bg-secondary text-secondary-content border-secondary',
    sub:  'bg-accent text-secondary-content border-base-300',
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'root':
        return <Target className="w-3 h-3 inline mr-1" />;
      case 'main':
        return <FileText className="w-3 h-3 inline mr-1" />;
      case 'sub':
        return <Edit3 className="w-3 h-3 inline mr-1" />;
      default:
        return null;
    }
  };

  const handleEdit = useCallback(() => {
    onAction('edit', node.id, text.trim() || 'New Node');
    setIsEditing(false);
  }, [node.id, text, onAction]);

  const handleMouseDown = useCallback((e) => {
    if (isEditing) return;
    e.stopPropagation(); 
    onAction('select', node.id, e.shiftKey);
    onAction('dragStart', node.id, { clientX: e.clientX, clientY: e.clientY }); // Pass clientX/Y
  }, [node.id, isEditing, onAction]);

  return (
    <div
      style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
      className={`absolute cursor-grab transition-transform ${isSelected ? 'z-20' : 'z-10'}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className={`relative rounded-xl border-2 min-w-[150px] max-w-[200px] text-center shadow-md hover:shadow-xl transition-all group ${nodeStyles[node.type] || nodeStyles.sub} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
        <div className="px-4 py-3">
          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setText(node.text);
                }
              }}
              className="w-full bg-transparent text-center resize-none outline-none text-sm"
              rows={2}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="text-sm font-medium break-words">
              {getNodeIcon(node.type)}
              {node.text}
            </div>
          )}
        </div>
        <div className={`absolute -top-2 -right-2 flex gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('connect', node.id); }}
            className={`btn btn-xs btn-circle ${isConnecting ? 'btn-primary' : 'btn-ghost bg-base-100/90'}`}
            title="Connect (C)"
          >
            <Link className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('delete', node.id); }}
            className="btn btn-xs btn-circle btn-error"
            title="Delete (Del)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        {isSelected && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2">
            <select
              value={node.type}
              onChange={(e) => onAction('changeType', node.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="select select-xs"
            >
              <option value="root">Root</option>
              <option value="main">Main</option>
              <option value="sub">Sub</option>
            </select>
          </div>
        )}
        {isConnecting && <div className="absolute inset-0 rounded-xl border-2 border-primary border-dashed animate-pulse" />}
      </div>
    </div>
  );
};

// Main Mindmap component
const Mindmap = ({ data, onDataChange }) => {
  const { nodes = [], connections = [] } = data || {};
  
  const [dragState, setDragState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const fileRef = useRef(null);

  const { view, canvasRef, screenToCanvas, zoom, pan, reset } = useViewport();
  const { selectedIds, connectingFrom, setConnectingFrom, select, clear } = useSelection();

  // Calculate dynamic SVG bounds
  const calculateSVGBounds = useCallback(() => {
    if (!nodes.length) return { width: 2000, height: 2000, minX: -1000, minY: -1000 };
    
    const padding = 500;
    const minX = Math.min(...nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...nodes.map(n => n.x)) + padding;
    const minY = Math.min(...nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...nodes.map(n => n.y)) + padding;
    
    return {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      minY
    };
  }, [nodes]);

  const svgBounds = calculateSVGBounds();
  const viewBox = `${svgBounds.minX} ${svgBounds.minY} ${svgBounds.width} ${svgBounds.height}`;

  const handleAction = useCallback((action, id, payload) => {
    const currentNodes = data?.nodes || [];
    const currentConnections = data?.connections || [];

    switch (action) {
      case 'select':
        if (connectingFrom && connectingFrom !== id) {
          const exists = currentConnections.some(c =>
            (c.from === connectingFrom && c.to === id) || (c.from === id && c.to === connectingFrom)
          );
          if (!exists) {
            const newConnections = [...currentConnections, { from: connectingFrom, to: id }];
            onDataChange({ nodes: currentNodes, connections: newConnections });
          }
          setConnectingFrom(null);
        } else {
          select(id, payload);
        }
        break;

      case 'edit': {
        const newNodes = currentNodes.map(n => n.id === id ? { ...n, text: payload } : n);
        onDataChange({ nodes: newNodes, connections: currentConnections });
        break;
      }

      case 'delete': {
        const idsToDelete = selectedIds.includes(id) ? selectedIds : [id];
        const newNodes = currentNodes.filter(n => !idsToDelete.includes(n.id));
        const newConnections = currentConnections.filter(c => !idsToDelete.includes(c.from) && !idsToDelete.includes(c.to));
        onDataChange({ nodes: newNodes, connections: newConnections });
        clear();
        break;
      }

      case 'connect':
        setConnectingFrom(connectingFrom === id ? null : id);
        break;

      case 'changeType': {
        const newNodes = currentNodes.map(n => n.id === id ? { ...n, type: payload } : n);
        onDataChange({ nodes: newNodes, connections: currentConnections });
        break;
      }

      case 'dragStart':
        setDragState({
          type: 'node',
          startX: payload.clientX,
          startY: payload.clientY,
          nodeIds: selectedIds.includes(id) ? selectedIds : [id]
        });
        break;
    }
  }, [data, onDataChange, select, clear, selectedIds, connectingFrom, setConnectingFrom]);

  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!dragState) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (dragState.type === 'node') {
      const currentNodes = data?.nodes || [];
      const newNodes = currentNodes.map(node => {
        if (dragState.nodeIds.includes(node.id)) {
          return { ...node, x: node.x + dx / view.scale, y: node.y + dy / view.scale };
        }
        return node;
      });
      onDataChange({ nodes: newNodes, connections: data?.connections || [] });
    } else if (dragState.type === 'canvas') {
      pan(dx, dy);
    }
    
    setDragState(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
  }, [dragState, view.scale, pan, data, onDataChange]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.closest('svg')) { 
      setDragState({ type: 'canvas', startX: e.clientX, startY: e.clientY });
      clear(); 
    }
  }, [canvasRef, clear]);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.closest('svg')) {}
  }, [canvasRef]); 

  const handleCanvasDoubleClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.closest('svg')) {
      const currentNodes = data?.nodes || [];
      const currentConnections = data?.connections || [];
      const pos = screenToCanvas({ x: e.clientX, y: e.clientY });
      const newNode = {
        id: Date.now().toString(),
        text: 'New Idea',
        type: 'sub',
        x: pos.x,
        y: pos.y
      };
      const newNodes = [...currentNodes, newNode];
      onDataChange({ nodes: newNodes, connections: currentConnections });
      select(newNode.id);
    }
  }, [canvasRef, screenToCanvas, select, data, onDataChange]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    zoom(e.deltaY, { x: e.clientX, y: e.clientY });
  }, [zoom]);

  const addChildNode = useCallback(() => {
    if (selectedIds.length !== 1) return;
    const currentNodes = data?.nodes || [];
    const currentConnections = data?.connections || [];
    const parent = currentNodes.find(n => n.id === selectedIds[0]);
    if (!parent) return;

    const newNode = {
      id: Date.now().toString(),
      text: 'New Branch',
      type: 'sub',
      x: parent.x + 150,
      y: parent.y + 100
    };

    const newNodes = [...currentNodes, newNode];
    const newConnections = [...currentConnections, { from: parent.id, to: newNode.id }];
    onDataChange({ nodes: newNodes, connections: newConnections });
    select(newNode.id);
  }, [selectedIds, data, select, onDataChange]);

  const exportData = useCallback(() => {
    const exportContent = {
        nodes: data?.nodes || [],
        connections: data?.connections || []
    };
    const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { nodes: newNodes, connections: newConnections } = JSON.parse(event.target.result);
        if (Array.isArray(newNodes) && Array.isArray(newConnections)) {
          onDataChange({ nodes: newNodes, connections: newConnections });
          clear();
        }
      } catch (error) {
        console.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }, [clear, onDataChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.matches('input, textarea')) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            e.preventDefault();
            handleAction('delete', selectedIds[0]);
          }
          break;
        case 'Escape':
          clear();
          setConnectingFrom(null);
          break;
        case 'c':
        case 'C':
          if (selectedIds.length === 1) {
            e.preventDefault();
            handleAction('connect', selectedIds[0]);
          }
          break;
        case 'Tab':
          if (selectedIds.length === 1) {
            e.preventDefault();
            addChildNode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup wheel listener
    const canvasEl = canvasRef.current;
    canvasEl?.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl?.removeEventListener('wheel', handleWheel);
    };
  }, [selectedIds, handleAction, clear, addChildNode, handleMouseMove, handleMouseUp, setConnectingFrom, handleWheel]);
  
  const renderConnectionPreview = () => {
    if (!connectingFrom) return null;
    const fromNode = nodes.find(n => n.id === connectingFrom);
    if (!fromNode) return null;
    const toPos = screenToCanvas(mousePos);

    return (
      <line
        x1={fromNode.x} y1={fromNode.y}
        x2={toPos.x} y2={toPos.y}
        className="stroke-primary stroke-2"
        strokeDasharray="5,5"
      />
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-base-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-base-100 border-b border-base-300">
        <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm">Mind Map</h2>
          <div className="badge badge-outline badge-sm">{nodes.length} nodes</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => zoom(1, { x: window.innerWidth / 2, y: window.innerHeight / 2 })} className="btn btn-xs btn-ghost" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={reset} className="btn btn-xs btn-ghost" title="Reset View"><Home className="w-4 h-4" /></button>
          <button onClick={() => zoom(-1, { x: window.innerWidth / 2, y: window.innerHeight / 2 })} className="btn btn-xs btn-ghost" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
          <div className="divider divider-horizontal mx-1"></div>
          <input ref={fileRef} type="file" accept=".json" onChange={importData} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="btn btn-xs btn-ghost" title="Import"><FolderOpen className="w-4 h-4" /></button>
          <button onClick={exportData} className="btn btn-xs btn-ghost" title="Export"><Save className="w-4 h-4" /></button>
        </div>
      </div>
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-grab"
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        <div className="absolute inset-0">
          <div
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}
          >
            <svg 
              className="absolute inset-0" 
              width={svgBounds.width} 
              height={svgBounds.height} 
              viewBox={viewBox}
              xmlns="http://www.w3.org/2000/svg"
              style={{ left: svgBounds.minX, top: svgBounds.minY }}
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="stroke-base-content/10"/>
                </pattern>
              </defs>
              <rect 
                x={svgBounds.minX} 
                y={svgBounds.minY}
                width={svgBounds.width} 
                height={svgBounds.height} 
                fill="url(#grid)" 
              />
              {connections.map((conn, i) => {
                const from = nodes.find(n => n.id === conn.from);
                const to = nodes.find(n => n.id === conn.to);
                return (<Connection key={`${conn.from}-${conn.to}-${i}`} from={from} to={to} isSelected={selectedIds.includes(conn.from) || selectedIds.includes(conn.to)}/>);
              })}
              {renderConnectionPreview()}
            </svg>
            {nodes.map(node => (
              <Node key={node.id} node={node} isSelected={selectedIds.includes(node.id)} isConnecting={connectingFrom === node.id} onAction={handleAction}/>
            ))}
          </div>
        </div>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-base-content/50 pointer-events-none">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
              <h3 className="text-lg font-semibold mb-2">Start Your Mind Map</h3>
              <p className="text-sm">Double-click anywhere to add your first idea.</p>
            </div>
          </div>
        )}
        {connectingFrom && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 alert alert-info shadow-lg max-w-md p-2">
            <Link className="w-4 h-4" />
            <span className="text-xs">Click another node to connect. Press ESC to cancel.</span>
          </div>
        )}
      </div>
      <div className="flex justify-between px-3 py-1 bg-base-100 border-t border-base-300 text-xs text-base-content/60">
        <span>Double-click to add • Drag to move • Tab for child • C to connect</span>
        <span>Zoom: {Math.round(view.scale * 100)}%</span>
      </div>
    </div>
  );
};
//test
export default Mindmap;