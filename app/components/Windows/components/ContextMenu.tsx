"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
  visible: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
  visible,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!visible || !position) {
      setIsAnimating(false);
      setAdjustedPosition(null);
      return;
    }

    // Set position first, then start animation after a small delay
    setAdjustedPosition(position);
    
    // Use requestAnimationFrame to ensure position is set before animation starts
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    // If menu ref is available, adjust position for viewport bounds
    if (menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position if menu would overflow
      if (position.x + menuRect.width > viewport.width) {
        adjustedX = viewport.width - menuRect.width - 8;
      }

      // Adjust vertical position if menu would overflow
      if (position.y + menuRect.height > viewport.height) {
        adjustedY = viewport.height - menuRect.height - 8;
      }

      // Only update if position actually changed
      if (adjustedX !== position.x || adjustedY !== position.y) {
        setAdjustedPosition({ x: adjustedX, y: adjustedY });
      }
    }
  }, [visible, position]);

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible || !adjustedPosition || !position) return null;

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.action();
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-[180px] max-w-[280px] bg-background/50 backdrop-blur-[8px] border border-gray-200/30 rounded-lg shadow-2xl py-1 transition-all duration-200 ease-out ${
        isAnimating 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95'
      }`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transformOrigin: 'top left',
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="h-px bg-gray-200/20 mx-2 my-1"
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`
              w-full flex items-center cursor-pointer gap-3 px-3 py-2 text-sm text-left transition-colors duration-75
              ${item.disabled
                ? "text-gray-400 cursor-not-allowed"
                : item.destructive
                  ? "text-red-600 hover:bg-red-50/10 active:bg-red-100/10"
                  : "hover:bg-blue-50/10 active:bg-blue-100/10"
              }
              ${!item.disabled && "hover:outline-none focus:outline-none"}
            `}
          >
            {item.icon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {item.icon}
              </span>
            )}
            <span className="flex-1 truncate">{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
};

// Hook for managing context menu state
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    visible: boolean;
  }>({
    position: { x: 0, y: 0 },
    visible: false,
  });

  const showContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Get more precise positioning
    const rect = event.currentTarget.getBoundingClientRect();

    // Position the menu slightly offset from the click point for better UX
    setContextMenu({
      position: {
        x: event.clientX + 4, // Small offset to avoid cursor overlap
        y: event.clientY + 4
      },
      visible: true,
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
};