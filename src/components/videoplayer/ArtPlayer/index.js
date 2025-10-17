"use client"
import Player from './player';

function ArtPlayer({ dataInfo, id, groupedEp, src, session, savedep, subtitles, thumbnails, skiptimes }) {
  return (
    <Player
      dataInfo={dataInfo}
      id={id}
      groupedEp={groupedEp}
      src={src}
      session={session}
      savedep={savedep}
      subtitles={subtitles}
      thumbnails={thumbnails}
      skiptimes={skiptimes}
    />
  );
}

export default ArtPlayer; 
