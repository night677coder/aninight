"use client";

import React from 'react';
import Navbarcomponent from '@/components/navbar/Navbar';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faCode, faServer, faDatabase, faCloud, faArrowLeft, faRocket, faBolt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import styles from './about.module.css';

const About = () => {
  const features = [
    { icon: faRocket, title: "Lightning Fast", description: "Optimized performance for seamless streaming" },
    { icon: faBolt, title: "Real-time Updates", description: "Latest episodes added within hours" },
    { icon: faShieldAlt, title: "Secure & Safe", description: "Protected browsing experience" }
  ];

  const technologies = [
    { icon: faCode, title: "Next.js 14", description: "React framework with server components and app router" },
    { icon: faServer, title: "API Integration", description: "Multiple anime APIs for comprehensive data" },
    { icon: faDatabase, title: "AniList Sync", description: "Track your progress across devices" },
    { icon: faCloud, title: "CDN Delivery", description: "Global content delivery for optimal speed" }
  ];

  return (
    <div className={styles.container}>
      <Navbarcomponent />
      
      {/* Animated background elements */}
      <div className={styles.bgElements}>
        <div className={styles.gridOverlay}></div>
        <div className={styles.glowOrb1}></div>
        <div className={styles.glowOrb2}></div>
      </div>
      
      <div className={styles.content}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.hero}
        >
          <Link href="/" className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Home</span>
          </Link>
          
          <div className={styles.heroContent}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={styles.logoSection}
            >
              <span className={styles.logoIcon}>◆</span>
              <h1 className={styles.title}>VOID<span className={styles.titleHighlight}>ANIME</span></h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={styles.subtitle}
            >
              Your premier destination for high-quality anime streaming. Experience anime like never before 
              with our cutting-edge platform designed for true enthusiasts.
            </motion.p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Why Choose AniNight</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={feature.icon} />
                  <span className={styles.iconGlow}></span>
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technologies Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Built With Modern Technology</h2>
          <div className={styles.techGrid}>
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className={styles.techCard}
              >
                <div className={styles.techHeader}>
                  <div className={styles.techIcon}>
                    <FontAwesomeIcon icon={tech.icon} />
                  </div>
                  <h3 className={styles.techTitle}>{tech.title}</h3>
                </div>
                <p className={styles.techDescription}>{tech.description}</p>
                <div className={styles.techGlow}></div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Community Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className={styles.section}
        >
          <div className={styles.communityCard}>
            <h2 className={styles.communityTitle}>Join Our Community</h2>
            <p className={styles.communityDescription}>
              Connect with fellow anime enthusiasts, get updates, and be part of our growing community.
            </p>
            <div className={styles.socialLinks}>
              {[
                { icon: faGithub, label: "GitHub", url: "https://www.instagram.com/blind_emperor?igsh=MXJpMjRsbzh6cGcxag==" },
                { icon: faInstagram, label: "Instagram", url: "https://www.instagram.com/blind_emperor?igsh=MXJpMjRsbzh6cGcxag==" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={social.icon} />
                  <span>{social.label}</span>
                  <span className={styles.socialGlow}></span>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className={styles.statsSection}
        >
          <div className={styles.statsGrid}>
            {[
              { value: "500K+", label: "Anime Titles" },
              { value: "50M+", label: "Episodes" },
              { value: "24/7", label: "Availability" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 2.0 + index * 0.1 }}
                className={styles.statCard}
              >
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;