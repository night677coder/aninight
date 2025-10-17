'use server'
import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { connectMongo } from "@/mongodb/db";
import MangaRead from "@/mongodb/models/mangaRead";
import { revalidatePath } from "next/cache";

export const getMangaReadHistory = async () => {
  try {
    await connectMongo();
    const session = await getAuthSession();
    if (!session) {
      return;
    }
    const history = await MangaRead.find({ userName: session.user.name });

    if (!history) {
      return [];
    }
    return JSON.parse(JSON.stringify(history));
  } catch (error) {
    console.error("Error fetching manga read history", error);
  }
  revalidatePath("/");
};

export const createMangaRead = async (mangaId, chapterNum) => {
  try {
    await connectMongo();
    const session = await getAuthSession();

    if (!session) {
      return;
    }

    const existingRead = await MangaRead.findOne({
      userName: session?.user.name,
      mangaId: mangaId,
      chapterNum: chapterNum,
    });

    if (existingRead) {
      return null;
    }

    const newRead = await MangaRead.create({
      userName: session?.user.name,
      mangaId: mangaId,
      chapterNum: chapterNum,
    });

    return JSON.parse(JSON.stringify(newRead));
  } catch (error) {
    console.error("Error creating manga read tracking:", error);
    return;
  }
};

export const getMangaChapter = async (mangaId, chapterNum) => {
  try {
    await connectMongo();
    const session = await getAuthSession();
    if (!session) {
      return;
    }

    if (mangaId && chapterNum) {
      const chapter = await MangaRead.find({
        userName: session.user.name,
        mangaId: mangaId,
        chapterNum: chapterNum,
      });
      if (chapter && chapter.length > 0) {
        return JSON.parse(JSON.stringify(chapter));
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return;
  }
};

export const updateMangaRead = async ({
  mangaId,
  mangaTitle,
  image,
  chapterId,
  chapterNum,
  pageNum,
  totalPages
}) => {
  try {
    await connectMongo();
    const session = await getAuthSession();

    if (!session) {
      return;
    }

    const updatedRead = await MangaRead.findOneAndUpdate(
      {
        userName: session?.user.name,
        mangaId: mangaId,
        chapterNum: chapterNum,
      },
      {
        $set: {
          mangaId: mangaId || null,
          mangaTitle: mangaTitle || null,
          image: image || null,
          chapterId: chapterId || null,
          chapterNum: chapterNum || null,
          pageNum: pageNum || 0,
          totalPages: totalPages || null,
        },
      },
      { new: true, upsert: true }
    );

    if (!updatedRead) {
      return;
    }

    return JSON.parse(JSON.stringify(updatedRead));
  } catch (error) {
    console.log('Error updating manga read:', error);
    return;
  }
};

export const deleteMangaRead = async (data) => {
  try {
    await connectMongo();
    const session = await getAuthSession();

    if (!session) {
      return;
    }

    let deletedData;

    if (data.chapterId) {
      deletedData = await MangaRead.findOneAndDelete({
        userName: session?.user.name,
        chapterId: data.chapterId
      });
    } else if (data.mangaId) {
      deletedData = await MangaRead.deleteMany({
        userName: session?.user.name,
        mangaId: data.mangaId,
      });
    } else {
      return { message: "Invalid request, provide chapterId or mangaId" };
    }

    if (!deletedData) {
      return { message: "Data not found for deletion" };
    }

    const remainingData = JSON.parse(JSON.stringify(await MangaRead.find({ userName: session?.user.name })));

    return { message: `Removed manga from history`, remainingData, deletedData };
  } catch (error) {
    console.log(error);
    return;
  }
};
