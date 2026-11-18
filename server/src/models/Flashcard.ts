import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashcardDeck extends Document {
  ownerId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  resourceIds: mongoose.Types.ObjectId[];
  title: string;
  description: string;
  cardCount: number;
  visibility: 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

export const FlashcardDeck = mongoose.model<IFlashcardDeck>(
  'FlashcardDeck',
  new Schema(
    {
      ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
      resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
      title: { type: String, required: true, trim: true },
      description: { type: String, default: '' },
      cardCount: { type: Number, default: 0 },
      visibility: { type: String, enum: ['private', 'public'], default: 'public' },
    },
    { timestamps: true }
  )
);

export interface IFlashcard extends Document {
  deckId: mongoose.Types.ObjectId;
  front: string; // Question / Concept / Formula
  back: string;  // Detailed explanation / Derivation / Answer
  sourceRef: string; // Document title + Section citation
  interval: number; // Days until next review (SuperMemo SM-2 algorithm)
  repetition: number; // Consecutive successful reviews
  easeFactor: number; // SM-2 ease factor (default 2.5)
  dueDate: Date; // Next review date
  createdAt: Date;
  updatedAt: Date;
}

export const Flashcard = mongoose.model<IFlashcard>(
  'Flashcard',
  new Schema(
    {
      deckId: { type: Schema.Types.ObjectId, ref: 'FlashcardDeck', required: true, index: true },
      front: { type: String, required: true },
      back: { type: String, required: true },
      sourceRef: { type: String, default: '' },
      interval: { type: Number, default: 1 },
      repetition: { type: Number, default: 0 },
      easeFactor: { type: Number, default: 2.5 },
      dueDate: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
  )
);
