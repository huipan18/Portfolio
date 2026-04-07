"use client";
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
}

export default function DesktopContextMenu({ x, y, onClose }: ContextMenuProps) {
    const menuItems = [
        { label: 'New Folder', action: () => console.log('New Folder') },
        { type: 'separator' },
        { label: 'Get Info', action: () => console.log('Get Info') },
        { label: 'Change Wallpaper...', action: () => console.log('Change Wallpaper') },
        { label: 'Edit Widgets...', action: () => console.log('Edit Widgets') },
        { type: 'separator' },
        { label: 'Use Stacks', action: () => console.log('Use Stacks') },
        { 
            label: 'Sort By', 
            hasSubmenu: true,
            action: () => console.log('Sort By'),
            submenu: [
                { label: 'Name', action: () => console.log('Sort by Name') },
                { label: 'Date Modified', action: () => console.log('Sort by Date Modified') },
                { label: 'Date Created', action: () => console.log('Sort by Date Created') },
                { label: 'Size', action: () => console.log('Sort by Size') },
                { label: 'Kind', action: () => console.log('Sort by Kind') },
            ]
        },
        { label: 'Show View Options', action: () => console.log('Show View Options') },
    ];

    const handleItemClick = (item: any) => {
        if (item.action && !item.hasSubmenu) {
            item.action();
            onClose();
        }
    };

    // Calculate position to ensure menu doesn't go off-screen
    const menuWidth = 200;
    const menuHeight = 250; // Approximate height
    const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    return (
        <>
            {/* Backdrop to close menu when clicking outside */}
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />
            
            {/* Context Menu */}
            <div 
                className="fixed z-50 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-lg shadow-2xl py-1 min-w-[200px]"
                style={{ 
                    left: adjustedX, 
                    top: adjustedY,
                }}
            >
                {menuItems.map((item, index) => {
                    if (item.type === 'separator') {
                        return (
                            <div 
                                key={index} 
                                className="h-px bg-gray-600/50 my-1 mx-2" 
                            />
                        );
                    }

                    return (
                        <div
                            key={index}
                            className="px-3 py-1.5 text-sm text-white hover:bg-blue-600/80 cursor-pointer flex items-center justify-between transition-colors duration-150"
                            onClick={() => handleItemClick(item)}
                        >
                            <span>{item.label}</span>
                            {item.hasSubmenu && (
                                <ChevronRight size={14} className="text-gray-400" />
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
