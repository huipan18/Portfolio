"use client";
import React, { useState, useEffect } from 'react'
import LaunchPad from '../Windows/LaunchPad'
import { launchpadApps } from '@/Constants/constants'
import { ContextMenu, ContextMenuItem } from '../Windows/components/ContextMenu'
import { ExternalLink, Info, Trash2, Copy, Share } from 'lucide-react'
import useAppStore from '@/store'

export default function Desktop() {
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        type: 'desktop' | 'app';
        app?: typeof launchpadApps[0];
    } | null>(null);

    // Access sent to desktop items from store
    const { sentToDesktop, removeFromDesktop } = useAppStore();

    useEffect(() => {
        console.log(sentToDesktop);
    }, [sentToDesktop]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const target = e.target as HTMLElement;
        const launchpadItem = target.closest('[data-launchpad-item]');
        const isDesktopArea = target.closest('[data-desktop-area]') && !launchpadItem;
        
        // Close any existing context menus first
        closeContextMenu();
        
        if (launchpadItem) {
            // Get the app data from the launchpad item
            const appTitle = launchpadItem.querySelector('p')?.textContent;
            const app = sentToDesktop.find((app: any) => app.title === appTitle);
            
            if (app) {
                // Show app context menu
                setTimeout(() => {
                    setContextMenu({ 
                        x: e.clientX, 
                        y: e.clientY, 
                        type: 'app',
                        app 
                    });
                }, 0);
            }
        } else if (isDesktopArea) {
            // Show desktop context menu
            setTimeout(() => {
                setContextMenu({ 
                    x: e.clientX, 
                    y: e.clientY, 
                    type: 'desktop' 
                });
            }, 0);
        }
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    // Global context menu coordination
    useEffect(() => {
        const handleCloseAllContextMenus = () => {
            closeContextMenu();
        };

        // Listen for the custom close event
        document.addEventListener('closeAllContextMenus', handleCloseAllContextMenus);
        
        return () => {
            document.removeEventListener('closeAllContextMenus', handleCloseAllContextMenus);
        };
    }, []);

    // Handle removing app from desktop
    const handleRemoveFromDesktop = (appToRemove: typeof launchpadApps[0]) => {
        removeFromDesktop(appToRemove.id);
        console.log(`${appToRemove.title} removed from desktop`);
    };


    // Create unified context menu items based on type
    const createContextMenuItems = (type: 'desktop' | 'app', app?: typeof launchpadApps[0]): ContextMenuItem[] => {
        if (type === 'app' && app) {
            return [
                {
                    id: 'open',
                    label: 'Open',
                    icon: <ExternalLink size={16} />,
                    action: () => {
                        window.open(app.url, '_blank', 'noopener,noreferrer');
                    }
                },
                {
                    id: 'separator-1',
                    label: '',
                    separator: true,
                    action: () => {}
                },
                {
                    id: 'remove-from-desktop',
                    label: 'Remove from Desktop',
                    icon: <Trash2 size={16} />,
                    destructive: true,
                    action: () => {
                        handleRemoveFromDesktop(app);
                    }
                },
                {
                    id: 'separator-2',
                    label: '',
                    separator: true,
                    action: () => {}
                },
                {
                    id: 'copy-link',
                    label: 'Copy Link',
                    icon: <Copy size={16} />,
                    action: () => {
                        navigator.clipboard.writeText(app.url);
                        console.log('Copied link for', app.title);
                    }
                },
                {
                    id: 'share',
                    label: 'Share...',
                    icon: <Share size={16} />,
                    action: () => {
                        if (navigator.share) {
                            navigator.share({
                                title: app.title,
                                url: app.url
                            });
                        } else {
                            console.log('Share not supported');
                        }
                    }
                }
            ];
        } else {
            // Desktop context menu items
            return [
                { 
                    id: 'new-folder', 
                    label: 'New Folder', 
                    action: () => console.log('New Folder') 
                },
                { 
                    id: 'separator-1', 
                    label: '', 
                    separator: true, 
                    action: () => {} 
                },
                { 
                    id: 'get-info', 
                    label: 'Get Info', 
                    action: () => console.log('Get Info') 
                },
                { 
                    id: 'change-wallpaper', 
                    label: 'Change Wallpaper...', 
                    action: () => console.log('Change Wallpaper') 
                },
                { 
                    id: 'edit-widgets', 
                    label: 'Edit Widgets...', 
                    action: () => console.log('Edit Widgets') 
                },
                { 
                    id: 'separator-2', 
                    label: '', 
                    separator: true, 
                    action: () => {} 
                },
                { 
                    id: 'use-stacks', 
                    label: 'Use Stacks', 
                    action: () => console.log('Use Stacks') 
                },
                { 
                    id: 'show-view-options', 
                    label: 'Show View Options', 
                    action: () => console.log('Show View Options') 
                }
            ];
        }
    };

    return (
        <div 
            className='absolute inset-0 flex items-center justify-center h-full pt-10 w-screen overflow-hidden'
            onContextMenu={handleContextMenu}
            data-desktop-area
        >
            <div className='h-full w-full'> 
                <LaunchPad desktop={true} apps={sentToDesktop} />
            </div>
            
            {contextMenu && (
                <ContextMenu
                    items={createContextMenuItems(contextMenu.type, contextMenu.app)}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    visible={true}
                    onClose={closeContextMenu}
                />
            )}
        </div>
    )
}