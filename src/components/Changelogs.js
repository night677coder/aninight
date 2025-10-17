"use client";
import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import Link from "next/link";

const newVersion = "V2.1.0"

const releaseLogs = [
    {
        version: "V2.1.0",
        changes: [
            "VoidAnime with a refreshed user interface",
            "Improved episode listing with new display modes",
            "Better support for anime with large episode counts (20,000+)",
            "Enhanced mobile experience",
            "Dark mode improvements for better viewing experience",
            "Various bug fixes and performance enhancements"
        ],
    },
    {
        version: "V2.1.0",
        changes: [
            "Many anime now has Gogoanime, Zoro is also fixed.",
            "Now Episode details will be available for more anime.",
            "Newly added filler tag - Currently on Zoro Provider.",
            "Now u can find Uncensored Versions of anime.",
            "Major Performance Improvement.",
            "I guess Recent Episodes is fixed.",
            "Follow us on Instagram for more information",
        ],
    },
];

export default function Changelogs() {
    const [open, setopen] = useState(false);

    function closeModal() {
        localStorage.setItem("version", newVersion);
        setopen(false);
    }

    function getVersion() {
        let version = localStorage.getItem("version");
        if (version !== newVersion) {
            setopen(true);
        }
    }

    useEffect(() => {
        getVersion();
    }, []);

    return (
        <>
            <Modal
                isOpen={open}
                onOpenChange={closeModal}
                backdrop="blur"
                hideCloseButton={true}
                placement="center"
                scrollBehavior="inside"
                classNames={{
                    backdrop: "bg-black/90 backdrop-blur-md",
                    base: "bg-black border border-white/10 shadow-2xl shadow-white/5 mx-4 my-4 max-h-[90vh]",
                    body: "p-0",
                    footer: "border-t border-white/10"
                }}
                size="lg"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <div className="relative overflow-hidden">
                                    {/* Futuristic Grid Background */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                                            backgroundSize: '50px 50px'
                                        }} />
                                    </div>

                                    {/* Animated Corner Accents */}
                                    <div className="absolute top-0 left-0 w-10 h-10 sm:w-16 sm:h-16 border-t border-l sm:border-t-2 sm:border-l-2 border-white/30" />
                                    <div className="absolute top-0 right-0 w-10 h-10 sm:w-16 sm:h-16 border-t border-r sm:border-t-2 sm:border-r-2 border-white/30" />
                                    <div className="absolute bottom-0 left-0 w-10 h-10 sm:w-16 sm:h-16 border-b border-l sm:border-b-2 sm:border-l-2 border-white/30" />
                                    <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-16 sm:h-16 border-b border-r sm:border-b-2 sm:border-r-2 border-white/30" />

                                    <div className="relative p-4 sm:p-6 md:p-8">
                                        {/* Header Section */}
                                        <div className="flex flex-col items-center mb-4 sm:mb-6">
                                            <div className="relative mb-3 sm:mb-4">
                                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-white">
                                                    VOID<span className="text-white/50">ANIME</span>
                                                </h1>
                                                <div className="absolute -bottom-1 left-0 right-0 h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-white to-transparent" />
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="h-[1px] w-6 sm:w-10 bg-white/30" />
                                                <span className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] text-white/60 uppercase">Updates</span>
                                                <div className="h-[1px] w-6 sm:w-10 bg-white/30" />
                                            </div>

                                            {/* Version Badge */}
                                            <div className="relative inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2 border border-white/20 bg-white/5">
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                                                <span className="text-xs sm:text-sm tracking-wider sm:tracking-widest text-white font-mono">
                                                    V {newVersion}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Social Links */}
                                        <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                            <Link
                                                href="https://github.com/RishabNandal/skyanime"
                                                target="_blank"
                                                className="group relative p-2 sm:p-2.5 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/5"
                                                title="GitHub - Best ads free anime streaming website"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href="https://instagram.com/its.dark.devil"
                                                target="_blank"
                                                className="group relative p-2 sm:p-2.5 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/5"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href="https://discord.gg/aR6mmjfZVK"
                                                target="_blank"
                                                className="group relative p-2 sm:p-2.5 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/5"
                                            >
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 -28.5 256 256">
                                                    <path d="M216.856 16.597A208.502 208.502 0 00164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 00-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0079.735 175.3a136.413 136.413 0 01-21.846-10.632 108.636 108.636 0 005.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 005.355 4.237 136.07 136.07 0 01-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36zM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18z" />
                                                </svg>
                                            </Link>
                                        </div>

                                        {/* Changelog Content */}
                                        <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                                            {releaseLogs.map((log, logIndex) => (
                                                <div key={logIndex} className="relative">
                                                    <div className="space-y-2">
                                                        {log.changes.map((change, index) => (
                                                            <div key={index} className="group flex items-start gap-2 sm:gap-3 p-2 sm:p-2.5 border-l border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300">
                                                                <div className="mt-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/50 rotate-45 flex-shrink-0 group-hover:bg-white transition-colors" />
                                                                <p className="text-xs sm:text-sm text-white/70 group-hover:text-white/90 leading-relaxed transition-colors">
                                                                    {change}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {logIndex < releaseLogs.length - 1 && (
                                                        <div className="mt-3 sm:mt-4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="bg-black/50 backdrop-blur-sm p-3 sm:p-4">
                                <Button
                                    onPress={onClose}
                                    className="relative w-full sm:w-auto px-6 sm:px-8 py-2 bg-white text-black font-medium tracking-wider uppercase text-xs sm:text-sm hover:bg-white/90 transition-all duration-300 overflow-hidden group"
                                >
                                    <span className="relative z-10">Initialize</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </>
    );
}
