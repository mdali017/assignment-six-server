// comments.interface.ts
import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId | null;
  isEdited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TCommentResponse {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: {
    _id: Types.ObjectId;
    name: string;
    profilePicture?: string;
  };
  content: string;
  parentId?: Types.ObjectId | null;
  isEdited: boolean;
  replies?: TCommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}