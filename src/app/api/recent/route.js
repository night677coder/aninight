import { NextResponse } from "next/server";
import { getRecentAnimeEpisodes } from "@/lib/AnilistUser";

export const GET = async (req) => {
    try {
        // Use our direct AniList function instead of Anify API
        const data = await getRecentAnimeEpisodes();
        
        // Always return an array, even if empty
        return NextResponse.json(Array.isArray(data) && data.length > 0 ? data : []);
    } catch (error) {
        console.error("Error in recent episodes API route:", error);
        return NextResponse.json([]);
    }
};
