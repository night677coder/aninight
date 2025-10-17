"use client"
import { useSettings } from '@/lib/store';
import { useStore } from 'zustand';
import ContinueWatching from '@/components/home/ContinueWatching';
import ContinueReading from '@/components/home/ContinueReading';
import HomeNewsCard from '@/components/home/HomeNewsCard';
import UpcomingAnimeSection from '@/components/home/UpcomingAnimeSection';
import CurrentlyAiringSection from '@/components/home/CurrentlyAiringSection';
import TopRatedSection from '@/components/home/TopRatedSection';
import GenreSection from '@/components/home/GenreSection';
import RecentlyUpdatedSection from '@/components/home/RecentlyUpdatedSection';
import RandomRecommendationsSection from '@/components/home/RandomRecommendationsSection';
import PopularMangaSection from '@/components/home/PopularMangaSection';
import PremiumShowcaseSection from '@/components/home/PremiumShowcaseSection';
import TrendingNowSection from '@/components/home/TrendingNowSection';
import Top10Section from '@/components/home/Top10Section';
import PromoBanner from '@/components/home/PromoBanner';
import Greeting from '@/components/Greeting';
import { MotionDiv } from '@/utils/MotionDiv';

export default function HomeSectionRenderer({ 
    session, 
    herodata, 
    seasonaldata, 
    top100data, 
    upcomingData, 
    airingData, 
    topRatedData, 
    actionAnimeData, 
    recentlyUpdatedData, 
    randomRecsData, 
    popularMangaData,
    newsData 
}) {
    const settings = useStore(useSettings, (state) => state.settings);
    const homeSections = settings?.homeSections || [];

    const sectionComponents = {
        promoBanner: <PromoBanner />,
        greeting: <Greeting session={session} />,
        continueWatching: <ContinueWatching session={session} />,
        continueReading: <ContinueReading session={session} />,
        trendingNow: <TrendingNowSection animeList={herodata} />,
        top10: <Top10Section animeList={top100data} />,
        currentlyAiring: <CurrentlyAiringSection animeList={airingData} />,
        premiumShowcase: <PremiumShowcaseSection animeList={herodata} title="Premium Collection" />,
        popularManga: <PopularMangaSection mangaList={popularMangaData} />,
        news: <HomeNewsCard newsItems={newsData?.news} />,
        topRated: <TopRatedSection animeList={topRatedData} />,
        randomRecs: <RandomRecommendationsSection animeList={randomRecsData} />,
        upcoming: <UpcomingAnimeSection animeList={upcomingData} />,
        genre: <GenreSection animeList={actionAnimeData} genre="Action" />,
        recentlyUpdated: <RecentlyUpdatedSection animeList={recentlyUpdatedData} />
    };

    return (
        <>
            {homeSections.map((section, index) => {
                if (!section.enabled || !sectionComponents[section.id]) return null;
                
                return (
                    <MotionDiv
                        key={section.id}
                        initial={{ y: 10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                    >
                        {sectionComponents[section.id]}
                    </MotionDiv>
                );
            })}
        </>
    );
}
