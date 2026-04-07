'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Copy, Minus, CornerDownLeft, CornerDownRight } from 'lucide-react';

interface BezierPoint {
  x: number;
  y: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
  type?: 'smooth' | 'corner' | 'symmetric';
}

interface DragState {
  isDragging: boolean;
  pointIndex: number;
  handleType: 'point' | 'cp1' | 'cp2';
  startX: number;
  startY: number;
}

const BezierClipPath: React.FC = () => {
  const [points, setPoints] = useState<BezierPoint[]>([
    {
        "x": 0.4,
        "y": 0.35,
        "cp1x": 0.40040816326530615,
        "cp1y": 0.3827094920126277,
        "cp2x": 0.42,
        "cp2y": 0.35,
        "type": "smooth"
    },
    {
        "x": 0.6,
        "y": 0.35,
        "cp1x": 0.58,
        "cp1y": 0.35,
        "cp2x": 0.6,
        "cp2y": 0.4,
        "type": "smooth"
    },
    {
        "x": 0.6,
        "y": 0.65,
        "cp1x": 0.6020339300113992,
        "cp1y": 0.6125314965694989,
        "cp2x": 0.58,
        "cp2y": 0.65,
        "type": "smooth"
    },
    {
        "x": 0.4,
        "y": 0.65,
        "cp1x": 0.42,
        "cp1y": 0.65,
        "cp2x": 0.4,
        "cp2y": 0.6,
        "type": "smooth"
    }
]);

  const getPointsStats = () => {
    console.log(points);
  };
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    pointIndex: -1,
    handleType: 'point',
    startX: 0,
    startY: 0
  });
  const [hasDragged, setHasDragged] = useState(false);
  const [dragCooldown, setDragCooldown] = useState(false);
  
  const [showGrid, setShowGrid] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [lockedAngle, setLockedAngle] = useState<number | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapGuides, setSnapGuides] = useState<{x?: number, y?: number}>({});
  const [cursorMode, setCursorMode] = useState<'pan' | 'add-node' | 'move-node'>('pan');
  const [history, setHistory] = useState<BezierPoint[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dragStartState, setDragStartState] = useState<BezierPoint[] | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [suggestionNode, setSuggestionNode] = useState<{x: number, y: number, segmentIndex: number, t?: number, opacity?: number} | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const maxHistorySteps = 50;

  // History management
  const saveToHistory = useCallback((newPoints: BezierPoint[]) => {
    if (!Array.isArray(newPoints)) return;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newPoints)));
      
      if (newHistory.length > maxHistorySteps) {
        newHistory.shift();
        setHistoryIndex(current => current - 1);
        return newHistory;
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySteps - 1));
  }, [historyIndex, maxHistorySteps]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      if (Array.isArray(previousState)) {
        setPoints([...previousState]);
        setHistoryIndex(prev => prev - 1);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (Array.isArray(nextState)) {
        setPoints([...nextState]);
        setHistoryIndex(prev => prev + 1);
      }
    }
  }, [history, historyIndex]);

  const getSnapSuggestions = useCallback((x: number, y: number, isControlPoint: boolean = false, anchorPoint?: BezierPoint) => {
    if (!snapEnabled) return { x, y, guides: {} };
    
    const snapDistance = 0.02;
    let suggestedX = x;
    let suggestedY = y;
    const guides: {x?: number, y?: number} = {};
    
    if (isControlPoint && anchorPoint) {
      const dx = x - anchorPoint.x;
      const dy = y - anchorPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        
        const keyAngles = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345];
        
        let closestAngle = angle;
        let minAngleDiff = Infinity;
        
        for (const keyAngle of keyAngles) {
          const diff = Math.abs(angle - keyAngle);
          const wrappedDiff = Math.min(diff, 360 - diff);
          
          if (wrappedDiff < minAngleDiff && wrappedDiff < 7.5) {
            minAngleDiff = wrappedDiff;
            closestAngle = keyAngle;
          }
        }
        
        if (minAngleDiff < 7.5) {
          const radians = closestAngle * Math.PI / 180;
          suggestedX = anchorPoint.x + Math.cos(radians) * distance;
          suggestedY = anchorPoint.y + Math.sin(radians) * distance;
          
          suggestedX = Math.max(0, Math.min(1, suggestedX));
          suggestedY = Math.max(0, Math.min(1, suggestedY));
          
          guides.x = suggestedX;
          guides.y = suggestedY;
        }
        
        for (const point of points) {
          if (point === anchorPoint) continue;
          
          if (Math.abs(y - point.y) < snapDistance) {
            suggestedY = point.y;
            guides.y = point.y;
          }
          
          if (Math.abs(x - point.x) < snapDistance) {
            suggestedX = point.x;
            guides.x = point.x;
          }
        }
      }
    } else {
      for (const point of points) {
        if (Math.abs(y - point.y) < snapDistance) {
          suggestedY = point.y;
          guides.y = point.y;
        }
        
        if (Math.abs(x - point.x) < snapDistance) {
          suggestedX = point.x;
          guides.x = point.x;
        }
        
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < snapDistance) {
          suggestedX = point.x;
          suggestedY = point.y;
          guides.x = point.x;
          guides.y = point.y;
          break;
        }
      }
      
      const gridSize = 0.05; // 5% grid intervals for finer snapping
      const gridX = Math.round(x / gridSize) * gridSize;
      const gridY = Math.round(y / gridSize) * gridSize;
      
      if (Math.abs(x - gridX) < snapDistance && !guides.x) {
        suggestedX = gridX;
        guides.x = gridX;
      }
      
      if (Math.abs(y - gridY) < snapDistance && !guides.y) {
        suggestedY = gridY;
        guides.y = gridY;
      }
    }
    
    return { x: suggestedX, y: suggestedY, guides };
  }, [snapEnabled, points]);

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number, applySuggestions = true, isControlPoint = false, anchorPoint?: BezierPoint) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    // Convert to normalized coordinates (0-1)
    let x = mouseX / rect.width;
    let y = mouseY / rect.height;
    
    if (applySuggestions) {
      const suggestions = getSnapSuggestions(x, y, isControlPoint, anchorPoint);
      setSnapGuides(suggestions.guides);
      return { x: suggestions.x, y: suggestions.y };
    }
    
    setSnapGuides({});
    return { x, y };
  }, [getSnapSuggestions]);

  const findClosestPointOnPath = useCallback((x: number, y: number, segmentIndex: number) => {
    const currentPoint = points[segmentIndex];
    const nextPoint = points[(segmentIndex + 1) % points.length];
    
    let closestT = 0;
    let minDistance = Infinity;
    let closestX = currentPoint.x;
    let closestY = currentPoint.y;
    
    // Sample points along the curve to find the closest one
    for (let t = 0; t <= 1; t += 0.01) {
      let pathX, pathY;
      
      if (currentPoint.type === 'corner' && nextPoint.type === 'corner') {
        pathX = currentPoint.x + t * (nextPoint.x - currentPoint.x);
        pathY = currentPoint.y + t * (nextPoint.y - currentPoint.y);
      } else {
        const cp1x = (currentPoint.type === 'smooth' && currentPoint.cp2x !== undefined) ? currentPoint.cp2x : currentPoint.x;
        const cp1y = (currentPoint.type === 'smooth' && currentPoint.cp2y !== undefined) ? currentPoint.cp2y : currentPoint.y;
        const cp2x = (nextPoint.type === 'smooth' && nextPoint.cp1x !== undefined) ? nextPoint.cp1x : nextPoint.x;
        const cp2y = (nextPoint.type === 'smooth' && nextPoint.cp1y !== undefined) ? nextPoint.cp1y : nextPoint.y;
        
        const t1 = 1 - t;
        pathX = t1 * t1 * t1 * currentPoint.x + 3 * t1 * t1 * t * cp1x + 3 * t1 * t * t * cp2x + t * t * t * nextPoint.x;
        pathY = t1 * t1 * t1 * currentPoint.y + 3 * t1 * t1 * t * cp1y + 3 * t1 * t * t * cp2y + t * t * t * nextPoint.y;
      }
      
      const distance = Math.sqrt((x - pathX) ** 2 + (y - pathY) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestT = t;
        closestX = pathX;
        closestY = pathY;
      }
    }
    
    return { x: closestX, y: closestY, t: closestT };
  }, [points]);

  const getElementUnderCursor = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { type: 'none' as const };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    const x = mouseX / rect.width;
    const y = mouseY / rect.height;
    
    const hitRadius = 12 / Math.min(rect.width, rect.height);
    const pathHitRadius = 16 / Math.min(rect.width, rect.height);
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      const anchorDist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (anchorDist < hitRadius) {
        return { type: 'node' as const, index: i };
      }
      
      if (point.type === 'smooth' && point.cp1x !== undefined && point.cp1y !== undefined && point.cp2x !== undefined && point.cp2y !== undefined) {
        const cp1Dist = Math.sqrt((x - point.cp1x) ** 2 + (y - point.cp1y) ** 2);
        const cp2Dist = Math.sqrt((x - point.cp2x) ** 2 + (y - point.cp2y) ** 2);
        
        if (cp1Dist < hitRadius) {
          return { type: 'control' as const, index: i, handleType: 'cp1' as const };
        }
        if (cp2Dist < hitRadius) {
          return { type: 'control' as const, index: i, handleType: 'cp2' as const };
        }
      }
    }
    
    if (points.length > 1) {
      for (let i = 0; i < points.length; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % points.length];
        
        for (let t = 0; t <= 1; t += 0.02) {
          let pathX, pathY;
          
          if (currentPoint.type === 'corner' && nextPoint.type === 'corner') {
            pathX = currentPoint.x + t * (nextPoint.x - currentPoint.x);
            pathY = currentPoint.y + t * (nextPoint.y - currentPoint.y);
          } else {
            const cp1x = (currentPoint.type === 'smooth' && currentPoint.cp2x !== undefined) ? currentPoint.cp2x : currentPoint.x;
            const cp1y = (currentPoint.type === 'smooth' && currentPoint.cp2y !== undefined) ? currentPoint.cp2y : currentPoint.y;
            const cp2x = (nextPoint.type === 'smooth' && nextPoint.cp1x !== undefined) ? nextPoint.cp1x : nextPoint.x;
            const cp2y = (nextPoint.type === 'smooth' && nextPoint.cp1y !== undefined) ? nextPoint.cp1y : nextPoint.y;
            
            const t1 = 1 - t;
            pathX = t1 * t1 * t1 * currentPoint.x + 3 * t1 * t1 * t * cp1x + 3 * t1 * t * t * cp2x + t * t * t * nextPoint.x;
            pathY = t1 * t1 * t1 * currentPoint.y + 3 * t1 * t1 * t * cp1y + 3 * t1 * t * t * cp2y + t * t * t * nextPoint.y;
          }
          
          const pathDist = Math.sqrt((x - pathX) ** 2 + (y - pathY) ** 2);
          if (pathDist < pathHitRadius) {
            return { type: 'path' as const, index: i };
          }
        }
      }
    }
    
    return { type: 'none' as const };
  }, [points]);

  const handleMouseDown = useCallback((e: React.MouseEvent, pointIndex: number, handleType: 'point' | 'cp1' | 'cp2') => {
    e.preventDefault();
    e.stopPropagation();
    
    setHasDragged(false);
    setDragStartState(JSON.parse(JSON.stringify(points)));
    
    const point = points[pointIndex];
    let currentX, currentY;
    
    if (handleType === 'point') {
      currentX = point.x;
      currentY = point.y;
    } else if (handleType === 'cp1') {
      currentX = point.cp1x || point.x;
      currentY = point.cp1y || point.y;
    } else {
      currentX = point.cp2x || point.x;
      currentY = point.cp2y || point.y;
    }
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY, false);
    
    setDragState({
      isDragging: true,
      pointIndex,
      handleType,
      startX: coords.x - currentX,
      startY: coords.y - currentY
    });
  }, [getCanvasCoordinates, points]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return;
    
    setHasDragged(true);
    const { pointIndex, handleType, startX, startY } = dragState;
    const currentPoint = points[pointIndex];
    
    const isControlPoint = handleType === 'cp1' || handleType === 'cp2';
    const anchorPoint = isControlPoint ? currentPoint : undefined;
    
    let coords = getCanvasCoordinates(e.clientX, e.clientY, true, isControlPoint, anchorPoint);
    
    // Apply angle constraint when shift is pressed
    if (isShiftPressed && isControlPoint && anchorPoint) {
      const dx = coords.x - startX - anchorPoint.x;
      const dy = coords.y - startY - anchorPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        
        let snapAngle;
        
        if (lockedAngle !== null) {
          // Once locked to an angle, require significant movement to change (hysteresis)
          const angleDiff = Math.abs(angle - lockedAngle);
          const wrappedDiff = Math.min(angleDiff, 360 - angleDiff);
          
          // Require 22.5 degrees of movement to unlock from current angle
          if (wrappedDiff < 22.5) {
            snapAngle = lockedAngle;
          } else {
            // Allow switching to new angle with increased snap tolerance
            snapAngle = Math.round(angle / 15) * 15;
            setLockedAngle(snapAngle);
          }
        } else {
          // Initial lock - snap to nearest 15-degree increment
          snapAngle = Math.round(angle / 15) * 15;
          setLockedAngle(snapAngle);
        }
        
        const radians = snapAngle * Math.PI / 180;
        
        coords = {
          x: anchorPoint.x + Math.cos(radians) * distance,
          y: anchorPoint.y + Math.sin(radians) * distance
        };
        
        // Clamp to canvas bounds
        coords.x = Math.max(0, Math.min(1, coords.x));
        coords.y = Math.max(0, Math.min(1, coords.y));
      }
    } else if (isShiftPressed && handleType === 'point') {
      // For anchor points, constrain movement to horizontal/vertical when shift is pressed
      const dx = Math.abs(coords.x - startX - currentPoint.x);
      const dy = Math.abs(coords.y - startY - currentPoint.y);
      
      if (dx > dy) {
        // Lock to horizontal movement
        coords.y = currentPoint.y;
      } else {
        // Lock to vertical movement
        coords.x = currentPoint.x;
      }
    }
    
    const updatePointPosition = (pointIndex: number, x: number, y: number) => {
      setPoints(prev => {
        const newPoints = [...prev];
        const point = newPoints[pointIndex];
        
        const actualX = Math.max(0, Math.min(1, x));
        const actualY = Math.max(0, Math.min(1, y));
        
        if (handleType === 'point') {
          const deltaX = actualX - point.x;
          const deltaY = actualY - point.y;
          
          point.x = actualX;
          point.y = actualY;
          
          if (point.cp1x !== undefined && point.cp1y !== undefined) {
            point.cp1x = Math.max(0, Math.min(1, point.cp1x + deltaX));
            point.cp1y = Math.max(0, Math.min(1, point.cp1y + deltaY));
          }
          if (point.cp2x !== undefined && point.cp2y !== undefined) {
            point.cp2x = Math.max(0, Math.min(1, point.cp2x + deltaX));
            point.cp2y = Math.max(0, Math.min(1, point.cp2y + deltaY));
          }
        } else if (handleType === 'cp1') {
          point.cp1x = actualX;
          point.cp1y = actualY;
          
          if (point.type === 'symmetric' && point.cp2x !== undefined && point.cp2y !== undefined) {
            const dx = point.x - actualX;
            const dy = point.y - actualY;
            point.cp2x = Math.max(0, Math.min(1, point.x + dx));
            point.cp2y = Math.max(0, Math.min(1, point.y + dy));
          }
        } else if (handleType === 'cp2') {
          point.cp2x = actualX;
          point.cp2y = actualY;
          
          if (point.type === 'symmetric' && point.cp1x !== undefined && point.cp1y !== undefined) {
            const dx = point.x - actualX;
            const dy = point.y - actualY;
            point.cp1x = Math.max(0, Math.min(1, point.x + dx));
            point.cp1y = Math.max(0, Math.min(1, point.y + dy));
          }
        }
        
        return newPoints;
      });
    };

    const actualX = coords.x - startX;
    updatePointPosition(pointIndex, actualX, coords.y - startY);
  }, [dragState, getCanvasCoordinates, points]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragStartState && Array.isArray(dragStartState)) {
      const hasChanged = JSON.stringify(dragStartState) !== JSON.stringify(points);
      if (hasChanged) {
        saveToHistory(points);
      }
      
      // Handle point selection after drag ends (only if we didn't actually drag)
      if (!hasDragged && dragState.handleType === 'point') {
        setSelectedPoint(prev => prev === dragState.pointIndex ? null : dragState.pointIndex);
      }
      
      // Add cooldown period after dragging to prevent accidental node creation
      if (hasDragged) {
        setDragCooldown(true);
        setTimeout(() => setDragCooldown(false), 300); // 300ms cooldown
      }
    }
    setDragState(prev => ({ ...prev, isDragging: false }));
    setDragStartState(null);
    setIsPanning(false);
    setHasDragged(false);
    // Reset locked angle when drag ends
    setLockedAngle(null);
  }, [dragState.isDragging, dragState.handleType, dragState.pointIndex, dragStartState, saveToHistory, points, hasDragged]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const element = getElementUnderCursor(e.clientX, e.clientY);
    
    if (element.type === 'node' && element.index !== undefined) {
      handleMouseDown(e, element.index, 'point');
      return;
    }
    
    if (element.type === 'control' && element.index !== undefined && element.handleType) {
      handleMouseDown(e, element.index, element.handleType);
      return;
    }
  }, [getElementUnderCursor, handleMouseDown]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {    
    if (dragState.isDragging) {
      handleMouseMove(e as any);
    } else {
      const element = getElementUnderCursor(e.clientX, e.clientY);
      setHoveredPoint(element.type === 'node' ? element.index || null : null);
      
      if (isSpacePressed) {
        setCursorMode('pan');
        setSuggestionNode(null);
      } else if (element.type === 'node' || element.type === 'control') {
        setCursorMode('move-node');
        setSuggestionNode(null);
      } else if (element.type === 'path') {
        setCursorMode('add-node');
          // Show suggestion node at closest point on path for more fluid positioning
        const coords = getCanvasCoordinates(e.clientX, e.clientY, false); // Don't apply suggestions for hover
        const closestPoint = findClosestPointOnPath(coords.x, coords.y, element.index || 0);
        setSuggestionNode({
          x: closestPoint.x,
          y: closestPoint.y,
          segmentIndex: element.index || 0,
          t: closestPoint.t,
          opacity: 1
        });
      } else {
        setCursorMode('pan');
        // Fade out suggestion node instead of immediately removing it
        if (suggestionNode) {
          setSuggestionNode(prev => prev ? { ...prev, opacity: 0 } : null);
          setTimeout(() => setSuggestionNode(null), 200);
        }
      }
    }
  }, [dragState.isDragging, handleMouseMove, isPanning, panStart, getElementUnderCursor, isSpacePressed, getCanvasCoordinates]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (dragState.isDragging || hasDragged || dragCooldown) return;
    
    const element = getElementUnderCursor(e.clientX, e.clientY);
    
    // Deselect point if clicking on empty canvas
    if (element.type === 'none') {
      setSelectedPoint(null);
    }
    
    if (element.type === 'path' && element.index !== undefined) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY, false); // Don't apply suggestions for click position
      
      const insertIndex = element.index + 1;
      const prevIndex = element.index;
      const nextIndex = (element.index + 1) % points.length;
      const prevPoint = points[prevIndex];
      const nextPoint = points[nextIndex];
      
      const cp1Distance = 0.1;
      const cp2Distance = 0.1;
      
      const dx = nextPoint.x - prevPoint.x;
      const dy = nextPoint.y - prevPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = length > 0 ? dx / length : 0;
      const normalizedDy = length > 0 ? dy / length : 0;
      
      const newPoint: BezierPoint = {
        x: coords.x,
        y: coords.y,
        cp1x: Math.max(0, Math.min(1, coords.x - normalizedDx * cp1Distance)),
        cp1y: Math.max(0, Math.min(1, coords.y - normalizedDy * cp1Distance)),
        cp2x: Math.max(0, Math.min(1, coords.x + normalizedDx * cp2Distance)),
        cp2y: Math.max(0, Math.min(1, coords.y + normalizedDy * cp2Distance)),
        type: 'smooth'
      };
      
      setPoints(prev => {
        const newPoints = [...prev];
        newPoints.splice(insertIndex, 0, newPoint);
        setTimeout(() => saveToHistory(newPoints), 0);
        return newPoints;
      });
    }
  }, [dragState.isDragging, hasDragged, dragCooldown, getElementUnderCursor, getCanvasCoordinates, points, saveToHistory]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    handleMouseUp();
  }, [handleMouseUp]);

  const removePoint = (index: number) => {
    if (points.length <= 3) return;
    
    setPoints(prev => {
      const newPoints = prev.filter((_, i) => i !== index);
      setTimeout(() => saveToHistory(newPoints), 0);
      return newPoints;
    });
  };

  const togglePointType = (index: number) => {
    setPoints(prev => {
      const newPoints = [...prev];
      const point = newPoints[index];
      
      if (point.type === 'smooth') {
        point.type = 'corner';
        point.cp1x = point.x;
        point.cp1y = point.y;
        point.cp2x = point.x;
        point.cp2y = point.y;
      } else {
        point.type = 'smooth';
        const offset = 0.05;
        point.cp1x = Math.max(0, Math.min(1, point.x - offset));
        point.cp1y = Math.max(0, Math.min(1, point.y - offset));
        point.cp2x = Math.max(0, Math.min(1, point.x + offset));
        point.cp2y = Math.max(0, Math.min(1, point.y + offset));
      }
      
      setTimeout(() => saveToHistory(newPoints), 0);
      return newPoints;
    });
  };

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const generateSVGPath = useCallback(() => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x * 100} ${points[0].y * 100}`;
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      const cp1x = prevPoint.cp2x !== undefined ? prevPoint.cp2x * 100 : prevPoint.x * 100;
      const cp1y = prevPoint.cp2y !== undefined ? prevPoint.cp2y * 100 : prevPoint.y * 100;
      const cp2x = currentPoint.cp1x !== undefined ? currentPoint.cp1x * 100 : currentPoint.x * 100;
      const cp2y = currentPoint.cp1y !== undefined ? currentPoint.cp1y * 100 : currentPoint.y * 100;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x * 100} ${currentPoint.y * 100}`;
    }
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const cp1x = lastPoint.cp2x !== undefined ? lastPoint.cp2x * 100 : lastPoint.x * 100;
    const cp1y = lastPoint.cp2y !== undefined ? lastPoint.cp2y * 100 : lastPoint.y * 100;
    const cp2x = firstPoint.cp1x !== undefined ? firstPoint.cp1x * 100 : firstPoint.x * 100;
    const cp2y = firstPoint.cp1y !== undefined ? firstPoint.cp1y * 100 : firstPoint.y * 100;
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${firstPoint.x * 100} ${firstPoint.y * 100} Z`;
    
    return path;
  }, [points]);

  const generateClipPath = useCallback(() => {
    const path = generateSVGPath();
    return `clip-path: path('${path}');`;
  }, [generateSVGPath]);

  const copyToClipboard = async () => {
    console.log(points);
    try {
      await navigator.clipboard.writeText(generateClipPath());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const showTipsTemporarily = () => {
    setShowTips(true);
    setTimeout(() => setShowTips(false), 7250);
  };

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    
    const gridSpacing = 50;
    for (let x = 0; x <= width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
    
    // Snap guides
    if (snapGuides.x !== undefined) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(snapGuides.x * width, 0);
      ctx.lineTo(snapGuides.x * width, height);
      ctx.stroke();
    }
    
    if (snapGuides.y !== undefined) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, snapGuides.y * height);
      ctx.lineTo(width, snapGuides.y * height);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }, [showGrid, snapGuides]);

  const drawBezierPath = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (points.length === 0) return;
    
    ctx.save();
    
    // Draw filled shape
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x * width, points[0].y * height);
    
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      const cp1x = (prevPoint.cp2x !== undefined ? prevPoint.cp2x : prevPoint.x) * width;
      const cp1y = (prevPoint.cp2y !== undefined ? prevPoint.cp2y : prevPoint.y) * height;
      const cp2x = (currentPoint.cp1x !== undefined ? currentPoint.cp1x : currentPoint.x) * width;
      const cp2y = (currentPoint.cp1y !== undefined ? currentPoint.cp1y : currentPoint.y) * height;
      
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currentPoint.x * width, currentPoint.y * height);
    }
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const cp1x = (lastPoint.cp2x !== undefined ? lastPoint.cp2x : lastPoint.x) * width;
    const cp1y = (lastPoint.cp2y !== undefined ? lastPoint.cp2y : lastPoint.y) * height;
    const cp2x = (firstPoint.cp1x !== undefined ? firstPoint.cp1x : firstPoint.x) * width;
    const cp2y = (firstPoint.cp1y !== undefined ? firstPoint.cp1y : firstPoint.y) * height;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, firstPoint.x * width, firstPoint.y * height);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }, [points]);

  const drawControls = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    // Draw suggestion node if hovering over path
    if (suggestionNode) {
      const opacity = suggestionNode.opacity || 1;
      const pulseScale = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      
      // Outer pulse ring
      ctx.fillStyle = `rgba(34, 197, 94, ${0.2 * opacity * pulseScale})`;
      ctx.beginPath();
      ctx.arc(suggestionNode.x * width, suggestionNode.y * height, 16 * pulseScale, 0, 2 * Math.PI);
      ctx.fill();
      
      // Main suggestion node
      ctx.fillStyle = `rgba(34, 197, 94, ${0.8 * opacity})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(suggestionNode.x * width, suggestionNode.y * height, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Add plus icon with opacity
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 2;
      const centerX = suggestionNode.x * width;
      const centerY = suggestionNode.y * height;
      const size = 3.5;
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX + size, centerY);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX, centerY + size);
      ctx.stroke();
    }
    
    points.forEach((point, index) => {
      // Draw control lines
      if (point.cp1x !== undefined && point.cp1y !== undefined && point.type === 'smooth') {
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(point.x * width, point.y * height);
        ctx.lineTo(point.cp1x * width, point.cp1y * height);
        ctx.stroke();
      }
      
      if (point.cp2x !== undefined && point.cp2y !== undefined && point.type === 'smooth') {
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(point.x * width, point.y * height);
        ctx.lineTo(point.cp2x * width, point.cp2y * height);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
      
      // Draw control points
      if (point.cp1x !== undefined && point.cp1y !== undefined && point.type === 'smooth') {
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.cp1x * width, point.cp1y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      
      if (point.cp2x !== undefined && point.cp2y !== undefined && point.type === 'smooth') {
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.cp2x * width, point.cp2y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      
      // Draw anchor points with enhanced styling
      const isHovered = hoveredPoint === index;
      const baseRadius = isHovered ? 12 : 10;
      const color = point.type === 'corner' ? '#ef4444' : point.type === 'symmetric' ? '#10b981' : '#f59e0b';
      
      // Outer ring for hovered state
      if (isHovered) {
        ctx.fillStyle = color + '40';
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, baseRadius + 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Main anchor point
      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, baseRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Point number
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isHovered ? '12px' : '10px'} Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(index.toString(), point.x * width, point.y * height);
    });
    
    ctx.restore();
  }, [points, hoveredPoint, suggestionNode]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);
    
    drawGrid(ctx, width, height);
    drawBezierPath(ctx, width, height);
    drawControls(ctx, width, height);
  }, [drawGrid, drawBezierPath, drawControls]);


  // Initialize history with current points on mount and center the view
  useEffect(() => {
    if (history.length === 0 && points.length > 0) {
      setHistory([JSON.parse(JSON.stringify(points))]);
      setHistoryIndex(0);
    }
  }, [history.length, points]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGrid(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
      
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, isShiftPressed, undo, redo]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, points, showGrid, snapGuides, hoveredPoint, suggestionNode]);

  // Animation loop for smooth pulse effects
  useEffect(() => {
    const animate = () => {
      if (suggestionNode) {
        drawCanvas();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    if (suggestionNode) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [suggestionNode, drawCanvas]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Floating copy button */}
      <button
        onClick={copyToClipboard}
        className={`absolute top-6 right-6 z-10 p-3 rounded-xl shadow-lg border transition-all duration-200 ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-white/90 backdrop-blur-sm text-slate-700 border-slate-200 hover:bg-white hover:shadow-xl'
        }`}
        title={copied ? 'Copied!' : 'Copy CSS to clipboard'}
      >
        <Copy size={20} />
      </button>

      {/* Grid toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        className={`absolute top-6 left-6 z-10 p-3 rounded-xl shadow-lg border transition-all duration-200 ${
          showGrid
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white/90 backdrop-blur-sm text-slate-700 border-slate-200 hover:bg-white hover:shadow-xl'
        }`}
        title="Toggle grid (G)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      </button>

      {/* Snap toggle */}
      <button
        onClick={() => setSnapEnabled(!snapEnabled)}
        className={`absolute top-20 left-6 z-10 p-3 rounded-xl shadow-lg border transition-all duration-200 ${
          snapEnabled
            ? 'bg-purple-500 text-white border-purple-500'
            : 'bg-white/90 backdrop-blur-sm text-slate-700 border-slate-200 hover:bg-white hover:shadow-xl'
        }`}
        title="Toggle smart snapping"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
        </svg>
      </button>

      {/* Tips toggle */}
      <button
        onClick={showTipsTemporarily}
        className="absolute top-36 left-6 z-10 p-3 rounded-xl shadow-lg border transition-all duration-200 bg-white/90 backdrop-blur-sm text-slate-700 border-slate-200 hover:bg-white hover:shadow-xl"
        title="Show tips"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {/* Point controls overlay - appears when hovering over a point */}
      {(() => {
        const displayPoint = selectedPoint !== null ? selectedPoint : hoveredPoint;
        return displayPoint !== null && (
          <div 
            className={`absolute z-20 backdrop-blur-sm rounded-xl shadow-xl border p-3 pointer-events-auto ${
              selectedPoint !== null ? 'bg-blue-50/95 border-blue-200' : 'bg-white/95 border-slate-200'
            }`}
            style={{
              left: Math.min(window.innerWidth - 200, (points[displayPoint].x * 800 + 50)),
              top: Math.max(20, (points[displayPoint].y * 600 - 50))
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  points[displayPoint].type === 'corner' ? 'bg-red-500' : 
                  points[displayPoint].type === 'symmetric' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className={`text-sm font-medium ${
                selectedPoint !== null ? 'text-blue-700' : 'text-slate-700'
              }`}>Point {displayPoint} {selectedPoint !== null ? '(Selected)' : ''}</span>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => togglePointType(displayPoint)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title={points[displayPoint].type === 'smooth' ? 'Make corner' : 'Make smooth'}
              >
                {points[displayPoint].type === 'smooth' ? 
                  <CornerDownLeft size={16} /> : 
                  <CornerDownRight size={16} />
                }
              </button>
              
              {points.length > 3 && (
                <button
                  onClick={() => {
                    removePoint(displayPoint);
                    setSelectedPoint(null); // Deselect when removing
                  }}
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                  title="Remove point"
                >
                  <Minus size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main canvas */}
      <div 
        ref={containerRef}
        className="h-full relative overflow-hidden"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={800}
          height={600}
          onClick={handleCanvasClick}
          style={{
            cursor: isSpacePressed || isPanning ? 'grab' : 
                   cursorMode === 'move-node' ? 'move' : 'default'
          }}
        />
        
        {/* Instructions overlay - only shows when tips button is clicked */}
        {showTips && (
          <div className="absolute pointer-events-none bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-4 py-2 animate-[bounce_1s_ease-in-out_1]">
            <div className="text-xs text-slate-600 flex items-center gap-4">
              <span>• Click path to add point</span>
              <span>• Drag points to move</span>
              <span>• Hover point for controls</span>
              <span>• Shift + drag for angle snap</span>
              <span>• G Toggle grid</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BezierClipPath;