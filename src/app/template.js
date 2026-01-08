"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from "framer-motion";

export default function Template({children}){
    let pathname = usePathname();

    return(
        <>
            {/* <AnimatePresence mode={'wait'} initial={false}> */}
                <motion.div 
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                    }}
                    className="min-h-screen"
                >
                    {/* Completing page exit animation and load new page */}
                        {children}
                </motion.div>    
            {/* </AnimatePresence>  */}
        </>
    )
}