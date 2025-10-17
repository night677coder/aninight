import { Schema, model, models } from 'mongoose';

const MangaReadSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  mangaId: {
    type: String,
    required: true,
  },
  mangaTitle: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  chapterId: {
    type: String,
    default: null,
  },
  chapterNum: {
    type: String,
    required: true,
  },
  pageNum: {
    type: Number,
    default: 0,
  },
  totalPages: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MangaRead = models.MangaRead || model('MangaRead', MangaReadSchema);

export default MangaRead;
