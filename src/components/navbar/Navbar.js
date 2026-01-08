"use client"
import React, { useEffect, useState } from 'react';
import { DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, DropdownSection, Avatar, Badge, useDisclosure } from "@nextui-org/react";
import Link from "next/link"
import styles from '../../styles/Navbar.module.css'
import { useSession, signIn, signOut } from 'next-auth/react';
import { FeedbackIcon, LoginIcon, LogoutIcon, SettingsIcon, ProfileIcon } from '@/lib/SvgIcons';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Feedbackform from './Feedbackform';
import { NotificationTime } from '@/utils/TimeFunctions';
import { useTitle } from '@/lib/store';
import { useStore } from 'zustand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faChevronDown, faBars, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import BackButton from '@/components/BackButton';

// Suppress React warnings for NextUI components in development
if (typeof window !== 'undefined' && window.console) {
    const originalError = console.error;
    console.error = (...args) => {
        if (typeof args[0] === 'string' && 
            (args[0].includes('isDisabled') || args[0].includes('originalProps'))) {
            return;
        }
        originalError.apply(console, args);
    };
}

function Navbarcomponent({ home = false }) {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const iconClasses = "w-5 h-5 text-xl text-default-500 pointer-events-none flex-shrink-0";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { data, status } = useSession();
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();
    const [notifications, setNotifications] = useState([]);
    const [todayNotifications, setTodayNotifications] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('Today');

    const handleTimeframeChange = (e) => {
        setSelectedTimeframe(e.target.value);
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        }
        else {
            setHidden(false);
            setIsScrolled(false);
        }
        if (latest > 50) {
            setIsScrolled(true)
        }
    })

    useEffect(() => {
        if (status === 'authenticated') {
            setIsLoggedIn(true);
        }
        else {
            setIsLoggedIn(false);
        }
    }, [status])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (status === 'authenticated') {
                    const response = await fetch('/api/anilist/notifications?page=1');
                    if (response.ok) {
                        const data = await response.json();
                        const notify = data?.notifications?.filter(item => Object.keys(item).length > 0) || [];
                        setNotifications(notify);
                        const filteredNotifications = filterNotifications(notify);
                        setTodayNotifications(filteredNotifications);
                    }
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        }
        fetchNotifications();
    }, [status, data]);

    function filterNotifications(notifications) {
        if (!notifications || !Array.isArray(notifications)) return [];
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const oneDayInSeconds = 24 * 60 * 60;
        return notifications.filter(notification => {
            const createdAtTimestamp = notification.createdAt;
            const timeDifference = currentTimestamp - createdAtTimestamp;
            return timeDifference <= oneDayInSeconds;
        });
    }

    
    const navbarClass = isScrolled
        ? `${home ? styles.homenavbar : styles.navbar} ${home && styles.navbarscroll}`
        : home ? styles.homenavbar : styles.navbar;

    return (
        <>
            <motion.nav className={navbarClass}
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" },
                }}
                animate={hidden ? 'hidden' : 'visible'}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Futuristic glow line at top */}
                <div className={styles.topGlowLine}></div>
                
                <div className={styles.navleft}>
                    {/* Back Button - Only show on mobile and not on homepage */}
                    {!home && (
                        <div className="md:hidden mr-3 mt-2">
                            <BackButton />
                        </div>
                    )}
                    
                    <div className={styles.logoContainer}>
                        <Link href="/" className={styles.logoLink}>
                            <div className={styles.logoWrapper}>
                                <span className={styles.logoIcon}>◆</span>
                                <span className={styles.logoText}>
                                    ANI<span className={styles.logoHighlight}>NIGHT</span>
                                </span>
                            </div>
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className={styles.navItemsContainer}>
                    </div>
                </div>
                <div className={styles.navright}>
                    {/* Search Button */}
                    <Link href="/search" className={styles.searchButton}>
                        <FontAwesomeIcon icon={faSearch} className={styles.navIcon} />
                    </Link>
                    
                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className={styles.mobileMenuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        <FontAwesomeIcon 
                            icon={isMobileMenuOpen ? faTimes : faBars} 
                            className={styles.mobileMenuIcon}
                        />
                    </button>
                    
                    <div>
                        {isLoggedIn && (
                            <Dropdown placement="bottom-end" classNames={{
                                base: "before:bg-default-200",
                                content: "py-1 px-1 border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl",
                            }}>
                                <DropdownTrigger>
                                    <div className={styles.notificationButton}>
                                        <div className={styles.iconWrapper}>
                                            <Badge 
                                                style={{ backgroundColor: "#ffffff", color: "#000000" }} 
                                                content={todayNotifications?.length} 
                                                shape="circle" 
                                                showOutline={false} 
                                                size="sm"
                                            >
                                                <FontAwesomeIcon icon={faBell} className={styles.navIcon} />
                                            </Badge>
                                            <span className={styles.iconGlow}></span>
                                        </div>
                                    </div>
                                </DropdownTrigger>
                                <DropdownMenu variant="flat" className='w-[320px] '
                                    aria-label="Avatar Actions"
                                    emptyContent="No New Notifications"
                                >
                                    <DropdownSection title="Notifications">
                                        <DropdownItem
                                            isReadOnly
                                            classNames={{
                                                base: 'py-0 !hover:bg-none'
                                            }}
                                            key="theme"
                                            className="cursor-default"
                                            endContent={
                                                <select
                                                    className="z-10 outline-none cursor-pointer w-[72px] py-0.5 rounded-md text-tiny group-data-[hover=true]:border-default-500 border-small border-default-300 dark:border-default-200 bg-transparent text-default-500"
                                                    id="theme"
                                                    name="theme"
                                                    value={selectedTimeframe}
                                                    onChange={handleTimeframeChange}
                                                >
                                                    <option>Today</option>
                                                    <option>Recent</option>
                                                </select>
                                            }
                                        >
                                            Select Timeframe
                                        </DropdownItem>
                                    </DropdownSection>
                                    <DropdownSection className='w-full'>
                                        {selectedTimeframe === 'Today' ? (
                                            todayNotifications?.length > 0 ? todayNotifications?.slice(0, 3).map((item) => {
                                                const { contexts, media, episode, createdAt } = item;
                                                return (
                                                    <DropdownItem
                                                        key={item.id}
                                                        showFullDescription
                                                        description={`${contexts?.[0]} ${episode} ${contexts?.[1]} ${media?.title?.[animetitle] || media?.title?.romaji} ${contexts?.[contexts?.length - 1]}`}
                                                        className='py-2 w-full'
                                                        classNames={{
                                                            description: 'text-[11px] text-[#A1A1AA]',
                                                        }}
                                                    >
                                                        <div className='flex flex-row items-center justify-between w-[290px]'>
                                                            <p className='font-semibold text-[14px] w-full'>
                                                                {((media?.title?.[animetitle] || media?.title?.romaji) || '').slice(0, 24)}
                                                                {((media?.title?.[animetitle] || media?.title?.romaji) || '').length > 24 && '...'}
                                                            </p>
                                                            <span className='text-[#f1f1f1b2] text-[10px]'>{NotificationTime(createdAt)}</span>
                                                        </div>
                                                    </DropdownItem>
                                                );
                                            }) : (
                                                <DropdownItem
                                                    key={"Lol"}
                                                    showFullDescription
                                                    className='py-3 w-full text-center'
                                                >
                                                    No New Notifications
                                                </DropdownItem>
                                            )
                                        ) : (
                                            notifications?.length > 0 ? notifications?.slice(0, 3).map((item) => {
                                                const { contexts, media, episode, createdAt } = item;
                                                return (
                                                    <DropdownItem
                                                        key={item.id}
                                                        showFullDescription
                                                        description={`${contexts?.[0]} ${episode} ${contexts?.[1]} ${media?.title?.[animetitle] || media?.title?.romaji} ${contexts?.[contexts?.length - 1]}`}
                                                        className='py-2 w-full'
                                                        classNames={{
                                                            description: 'text-[11px] text-[#A1A1AA]',
                                                        }}
                                                    >
                                                        <div className='flex flex-row items-center justify-between w-[290px]'>
                                                            <p className='font-semibold text-[14px] w-full'>
                                                                {((media?.title?.[animetitle] || media?.title?.romaji) || '').slice(0, 24)}
                                                                {((media?.title?.[animetitle] || media?.title?.romaji) || '').length > 24 && '...'}
                                                            </p>
                                                            <span className='text-[#f1f1f1b2] text-[10px]'>{NotificationTime(createdAt)}</span>
                                                        </div>
                                                    </DropdownItem>
                                                );
                                            }) : (
                                                <DropdownItem
                                                    key={"Lol"}
                                                    showFullDescription
                                                    className='py-3 w-full text-center'
                                                >
                                                    No Notifications!
                                                </DropdownItem>
                                            )
                                        )}
                                        {selectedTimeframe === 'Today' && todayNotifications?.length > 0 &&
                                            <DropdownItem
                                                key={"delete"}
                                                showFullDescription
                                                className='py-2 w-full text-xl text-default-500 flex-shrink-0'
                                                style={{ color: "#ffffff" }}
                                            >
                                                <Link href={`/user/notifications`} className='w-full h-full block '>Show all</Link>
                                            </DropdownItem>
                                        }
                                        {selectedTimeframe !== 'Today' && notifications?.length > 0 &&
                                            <DropdownItem
                                                key={"delete"}
                                                showFullDescription
                                                className='py-2 w-full text-xl text-default-500 flex-shrink-0'
                                                style={{ color: "#ffffff" }}
                                            >
                                                <Link href={`/user/notifications`} className='w-full h-full block '>Show all</Link>
                                            </DropdownItem>
                                        }
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                </div>
                
            </motion.nav>
            
            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay}>
                    <div className={styles.mobileMenuContent}>
                        <div className={styles.mobileMenuHeader}>
                            <div className={styles.mobileLogoWrapper}>
                                <span className={styles.mobileLogo}>◆</span>
                                <span className={styles.mobileMenuTitle}>ANINIGHT</span>
                            </div>
                            {isLoggedIn && (
                                <div className={styles.mobileUserInfo}>
                                    <div className={styles.mobileUserDetails}>
                                        <span className={styles.mobileUserName}>{data?.user?.name || 'User'}</span>
                                        <span className={styles.mobileUserStatus}>Online</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className={styles.mobileNavSection}>
                            <div className={styles.mobileSectionTitle}>Navigation</div>
                            <Link href="/search" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faSearch} className={styles.mobileNavIcon} />
                                Search
                            </Link>
                            <Link href="/anime/catalog" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faBars} className={styles.mobileNavIcon} />
                                Browse
                            </Link>
                            <Link href="/anime/catalog?sortby=TRENDING_DESC" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faBars} className={styles.mobileNavIcon} />
                                Trending
                            </Link>
                            <Link href="/anime/catalog?format=MOVIE" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faBars} className={styles.mobileNavIcon} />
                                Movies
                            </Link>
                            <Link href="/anime/catalog?format=TV" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faBars} className={styles.mobileNavIcon} />
                                TV Shows
                            </Link>
                            <Link href="/manga/catalog" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faBars} className={styles.mobileNavIcon} />
                                Manga
                            </Link>
                            <Link href="/news" className={styles.mobileNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                                <FontAwesomeIcon icon={faBars} className={styles.mobileNavIcon} />
                                News
                            </Link>
                        </div>
                        
                        <div className={styles.mobileActionSection}>
                        </div>
                        
                        <div className={styles.mobileMenuFooter}>
                            <span className={styles.footerText}>© 2024 AniNight</span>
                            <div className={styles.footerDivider}></div>
                            <span className={styles.footerText}>Anime Streaming Platform</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbarcomponent
