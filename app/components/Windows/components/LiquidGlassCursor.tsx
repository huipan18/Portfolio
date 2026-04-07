"use client";
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

const CustomMousePointer = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
    <>
            <motion.div
                className="fixed w-[100px] h-[100px] overflow-hidden rounded-full border border-foreground/20 z-[999999999] pointer-events-none"
                animate={{
                    x: mousePosition.x - 50,
                    y: mousePosition.y - 50,
                }}
                // transition={{
                //     type: "spring",
                //     stiffness: 200,
                //     damping: 10,
                // }}
            >
                <div className='relative w-full h-full'>
                    <div className="absolute top-0 left-0 w-full h-full with-lg backdrop-blur-[4px]"></div>
                </div>
            </motion.div>
        </>
    );
};

export default CustomMousePointer;