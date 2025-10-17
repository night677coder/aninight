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
import { useTitle, useSearchbar } from '@/lib/store';
import { useStore } from 'zustand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faChevronDown, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

function Navbarcomponent({ home = false }) {
    const animetitle = useStore(useTitle, (state) => state.animetitle);
    const Isopen = useStore(useSearchbar, (state) => state.Isopen);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const iconClasses = "w-5 h-5 text-xl text-default-500 pointer-events-none flex-shrink-0";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { data, status } = useSession();
    const [hidden, setHidden] = useState(false);
    const { scrollY } = useScroll();
    const [notifications, setNotifications] = useState([]);
    const [todayNotifications, setTodayNotifications] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('Today');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                useSearchbar.setState({ Isopen: !useSearchbar.getState().Isopen });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [Isopen]);

    const navbarClass = isScrolled
        ? `${home ? styles.homenavbar : styles.navbar} ${home && styles.navbarscroll}`
        : home ? styles.homenavbar : styles.navbar;

    return (
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
                {/* Mobile Menu Button - Left Side */}
                <button
                    className={styles.mobileMenuButton}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                >
                    <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
                </button>

                <div className={styles.logoContainer}>
                    <Link href="/" className={styles.logoLink}>
                        <div className={styles.logoWrapper}>
                            <span className={styles.logoIcon}>◆</span>
                            <span className={styles.logoText}>
                                VOID<span className={styles.logoHighlight}>ANIME</span>
                            </span>
                        </div>
                    </Link>
                </div>
                
                {/* Desktop Navigation */}
                <div className={styles.navItemsContainer}>
                    <Link href="/anime/catalog" className={styles.navItem}>
                        <span className={styles.navItemText}>Browse</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                    <Link href="/anime/catalog?sortby=TRENDING_DESC" className={styles.navItem}>
                        <span className={styles.navItemText}>Trending</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                    <Link href="/anime/catalog?format=MOVIE" className={styles.navItem}>
                        <span className={styles.navItemText}>Movies</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                    <Link href="/anime/catalog?format=TV" className={styles.navItem}>
                        <span className={styles.navItemText}>TV Shows</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                    <Link href="/manga/catalog" className={styles.navItem}>
                        <span className={styles.navItemText}>Manga</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                    <Link href="/news" className={styles.navItem}>
                        <span className={styles.navItemText}>News</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                    <Link href="/about" className={styles.navItem}>
                        <span className={styles.navItemText}>About</span>
                        <span className={styles.navItemGlow}></span>
                    </Link>
                </div>
            </div>
            <div className={styles.navright}>
                <button
                    type="button"
                    title="Search"
                    onClick={() => useSearchbar.setState({ Isopen: true }) } 
                    className={styles.searchButton}
                >
                    <div className={styles.iconWrapper}>
                        <FontAwesomeIcon icon={faSearch} className={styles.navIcon} />
                        <span className={styles.iconGlow}></span>
                    </div>
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
                                            // <div className='flex flex-row gap-3'>
                                            //     <button className='bg-[#18181b] px-3 py-1'>Today</button>
                                            //     <button>Recent</button>
                                            // </div>
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
                <Dropdown placement="bottom-end" classNames={{
                    base: "before:bg-default-200",
                    content: "py-1 px-1 border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl",
                }}>
                    <DropdownTrigger>
                        <div className={styles.profileTrigger}>
                            <div className={styles.avatarWrapper}>
                                <Avatar
                                    isBordered
                                    isDisabled={status === 'loading'}
                                    as="button"
                                    className="transition-transform w-[32px] h-[32px]"
                                    color="primary"
                                    style={{ borderColor: "#ffffff", borderWidth: "2px" }}
                                    name={data?.user?.name}
                                    size="sm"
                                    src={data?.user?.image?.large || data?.user?.image?.medium || "/profile.png"}
                                />
                                <span className={styles.avatarGlow}></span>
                            </div>
                            <FontAwesomeIcon icon={faChevronDown} className={styles.dropdownIcon} />
                        </div>
                    </DropdownTrigger>
                    {isLoggedIn ? (
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="info" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">{data?.user?.name}</p>
                            </DropdownItem>
                            <DropdownItem key="profile" startContent={<ProfileIcon className={iconClasses} />}>
                            <Link href={`/user/profile`} className='w-full h-full block '>Profile</Link>
                                </DropdownItem>
                            <DropdownItem key="help_and_feedback" onPress={onOpen} startContent={<FeedbackIcon className={iconClasses} />}>Help & Feedback</DropdownItem>
                            <DropdownItem key="settings" startContent={<SettingsIcon className={iconClasses} />}>
                                <Link href={`/settings`} className='w-full h-full block '>Settings</Link>
                            </DropdownItem>
                            <DropdownItem key="logout" style={{ color: "#ffffff" }} startContent={<LogoutIcon className={iconClasses} />}>
                                <button className="font-semibold outline-none border-none w-full h-full block text-left" onClick={() => signOut('AniListProvider')}>Log Out</button>
                            </DropdownItem>
                        </DropdownMenu>
                    ) : (
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="notlogprofile" startContent={<LoginIcon className={iconClasses} />}>
                                <button className="font-semibold outline-none border-none w-full h-full block text-left" onClick={() => signIn('AniListProvider')}>Login With Anilist</button>
                            </DropdownItem>
                            <DropdownItem key="notloghelp_and_feedback" onPress={onOpen} startContent={<FeedbackIcon className={iconClasses} />}>Help & Feedback</DropdownItem>
                            <DropdownItem key="settings" startContent={<SettingsIcon className={iconClasses} />}>
                                <Link href={`/settings`} className='w-full h-full block '>Settings</Link>
                            </DropdownItem>
                        </DropdownMenu>
                    )}
                </Dropdown>
                <Feedbackform isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange} />
            </div>
            
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <motion.div 
                    className={styles.mobileMenuOverlay}
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <div className={styles.mobileMenuContent}>
                        {/* Mobile Menu Header */}
                        <div className={styles.mobileMenuHeader}>
                            <div className={styles.mobileLogoWrapper}>
                                <span className={styles.mobileLogo}>◆</span>
                                <span className={styles.mobileMenuTitle}>MENU</span>
                            </div>
                            {isLoggedIn && (
                                <div className={styles.mobileUserInfo}>
                                    <Avatar
                                        isBordered
                                        className="w-[40px] h-[40px]"
                                        style={{ borderColor: "#ffffff", borderWidth: "2px" }}
                                        name={data?.user?.name}
                                        src={data?.user?.image?.large || data?.user?.image?.medium || "/profile.png"}
                                    />
                                    <div className={styles.mobileUserDetails}>
                                        <span className={styles.mobileUserName}>{data?.user?.name}</span>
                                        <span className={styles.mobileUserStatus}>Online</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <div className={styles.mobileNavSection}>
                            <span className={styles.mobileSectionTitle}>BROWSE</span>
                            <Link href="/anime/catalog" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>🎬</span>
                                <span>Browse Anime</span>
                            </Link>
                            <Link href="/anime/catalog?sortby=TRENDING_DESC" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>🔥</span>
                                <span>Trending</span>
                            </Link>
                            <Link href="/anime/catalog?format=MOVIE" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>🎥</span>
                                <span>Movies</span>
                            </Link>
                            <Link href="/anime/catalog?format=TV" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>📺</span>
                                <span>TV Shows</span>
                            </Link>
                            <Link href="/manga/catalog" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>📚</span>
                                <span>Manga</span>
                            </Link>
                        </div>

                        {/* More Section */}
                        <div className={styles.mobileNavSection}>
                            <span className={styles.mobileSectionTitle}>MORE</span>
                            <Link href="/news" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>📰</span>
                                <span>News</span>
                            </Link>
                            <Link href="/about" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                <span className={styles.mobileNavIcon}>ℹ️</span>
                                <span>About</span>
                            </Link>
                        </div>

                        {/* Account Section */}
                        {isLoggedIn && (
                            <div className={styles.mobileNavSection}>
                                <span className={styles.mobileSectionTitle}>ACCOUNT</span>
                                <Link href="/user/profile" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                    <span className={styles.mobileNavIcon}>👤</span>
                                    <span>Profile</span>
                                </Link>
                                <Link href="/settings" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
                                    <span className={styles.mobileNavIcon}>⚙️</span>
                                    <span>Settings</span>
                                </Link>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className={styles.mobileActionSection}>
                            {isLoggedIn ? (
                                <button 
                                    className={styles.mobileNavButton}
                                    onClick={() => {
                                        signOut('AniListProvider');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <span className={styles.buttonIcon}>🚪</span>
                                    <span>Log Out</span>
                                </button>
                            ) : (
                                <button 
                                    className={styles.mobileNavButton}
                                    onClick={() => {
                                        signIn('AniListProvider');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <span className={styles.buttonIcon}>🔐</span>
                                    <span>Log In with AniList</span>
                                </button>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={styles.mobileMenuFooter}>
                            <span className={styles.footerText}>VOIDANIME © 2024</span>
                            <div className={styles.footerDivider}></div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    )
}

export default Navbarcomponent
