"use client"
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../../styles/MobileBottomNav.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faBook,
    faNewspaper,
    faTh,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

const MobileBottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { icon: faHome, text: 'Home', path: '/', action: null },
        { icon: faTh, text: 'Browse', path: '/anime/catalog', action: null },
        { icon: faBook, text: 'Manga', path: '/manga/catalog', action: null },
        { icon: faNewspaper, text: 'News', path: '/news', action: null },
        { icon: faInfoCircle, text: 'About', path: '/about', action: null }
    ];

    const isActive = (path) => {
        if (!path) return false;
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path.split('?')[0]);
    };

    const handleClick = (item) => {
        if (item.action) {
            item.action();
        } else if (item.path) {
            router.push(item.path);
        }
    };

    return (
        <nav className={styles.navigationContainer}>
            <div className={styles.navGrid}>
                {navItems.map((item, index) => (
                    <button
                        key={item.path || index}
                        className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                        onClick={() => handleClick(item)}
                    >
                        <div className={styles.iconWrapper}>
                            <FontAwesomeIcon icon={item.icon} className={styles.icon} />
                            {isActive(item.path) && <span className={styles.activeGlow}></span>}
                        </div>
                        <span className={styles.text}>{item.text}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
