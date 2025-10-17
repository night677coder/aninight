"use client"
import React,{useState,useEffect} from 'react'
import Link from 'next/link';
import NetflixStyleDetails from '@/components/details/NetflixStyleDetails';
import Characters from '@/components/details/Characters';
import DetailsEpisodeList from '@/components/DetailsEpisodeList';
import Seasons from '@/components/details/Seasons';

function DetailsContainer({data, id, session}) {
    const [list,setList] = useState(null);
    const [url, setUrl] = useState(null);

    useEffect(() => {
        const fetchlist = async()=>{
            if (session?.user?.token) {
                try {
                    const response = await fetch(`/api/anilist/user-lists?id=${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setList(data);
                    }
                } catch (error) {
                    console.error('Error fetching user lists:', error);
                }
            }
        }
        fetchlist();
    }, [session, id]);

    const progress = list!==null ? list?.status==='COMPLETED' ? 0 : list?.progress : 0

  return (
    <>
      <NetflixStyleDetails data={data} id={id} session={session} list={list} setList={setList} url={url} />
      
      {/* Episodes Section - Netflix Style */}
      <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 border-b border-[#333]">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-white mb-3 sm:mb-4 md:mb-6">Episodes</h2>
        <DetailsEpisodeList data={data} id={id} setUrl={setUrl} progress={progress}/>
      </div>
      
      {/* Seasons & Related - Netflix Style */}
      {data?.relations?.edges?.length > 0 && (
        <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 border-b border-[#333]">
          <h2 className="text-base sm:text-lg md:text-xl font-medium text-white mb-3 sm:mb-4 md:mb-6">Related Anime</h2>
          <Seasons relations={data.relations} />
        </div>
      )}
      
      {/* Characters & Voice Actors - Netflix Style */}
      {data?.characters?.edges?.length > 0 && (
        <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 border-b border-[#333]">
          <h2 className="text-base sm:text-lg md:text-xl font-medium text-white mb-3 sm:mb-4 md:mb-6">Cast</h2>
          <Characters data={data?.characters?.edges} />
        </div>
      )}
      
      {/* Recommendations - Modern UI */}
      {data?.recommendations?.nodes?.length > 0 && (
        <div className="px-4 sm:px-6 md:px-12 py-8 sm:py-10 md:py-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-8 rounded-md w-[.3rem] bg-white"></span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">More Like This</h2>
          </div>
          
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
            <div className="flex gap-3 sm:gap-4">
              {data.recommendations.nodes.slice(0, 20).map((item) => {
                const anime = item.mediaRecommendation;
                if (!anime) return null;
                
                return (
                  <Link 
                    key={anime.id} 
                    href={`/anime/info/${anime.id}`}
                    className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group"
                  >
                    <div className="relative bg-black border border-white/10 hover:border-white/30 rounded-lg overflow-hidden transition-all duration-300 h-[210px] sm:h-[240px] md:h-[270px]">
                      <img
                        src={anime.coverImage?.extraLarge || anime.coverImage?.large}
                        alt={anime.title?.english || anime.title?.romaji}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Play icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Score badge */}
                      {anime.averageScore && (
                        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-md">
                          <span className="text-white text-xs font-bold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {(anime.averageScore / 10).toFixed(1)}
                          </span>
                        </div>
                      )}
                      
                      {/* Title */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
                          {anime.title?.english || anime.title?.romaji}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default DetailsContainer
