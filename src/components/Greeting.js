"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/Animecard.module.css';

const Greeting = ({ session }) => {
  const [greeting, setGreeting] = useState('');
  const [timeEmoji, setTimeEmoji] = useState('');
  const { data } = useSession();
  const userData = session || data;

  useEffect(() => {
    const date = new Date();
    const hour = date.getHours();

    // Set appropriate greeting based on time of day
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
      setTimeEmoji('🌅');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
      setTimeEmoji('☀️');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good evening');
      setTimeEmoji('🌆');
    } else {
      setGreeting('Good night');
      setTimeEmoji('🌙');
    }
  }, []);

  return (
    <div className={styles.cardhead}>
      <span className={styles.bar}></span>
      <h1 className="text-[18px] md:text-[21px] font-medium mb-2">
        {timeEmoji} {greeting}{userData?.user?.name ? `, ${userData.user.name}` : ''}
      </h1>
    </div>
  );
};

export default Greeting;
