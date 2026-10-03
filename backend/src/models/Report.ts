import { registerModel } from '../lib/modelRegistry';
import mongoose, { Schema, Document } from 'mongoose';

export type ReportTargetType = 'post' | 'comment' | 'article';
export type ReportStatus = 'open' | 'actioned' | 'dismissed';

export interface IReport extends Document {
  target_type: ReportTargetType;
  target_id: mongoose.Types.ObjectId;
  post_id: mongoose.Types.ObjectId | null;
  reporter_user_id: string;
  reporter_username: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolved_at: Date | null;
  created_at: Date;
}

const reportSchema = new Schema<IReport>(
  {
    target_type: {
      type: String,
      enum: ['post', 'comment', 'article'],
      required: true,
      index: true,
    },
    target_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    post_id: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    reporter_user_id: {
      type: String,
      required: true,
      index: true,
    },
    reporter_username: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'actioned', 'dismissed'],
      default: 'open',
      index: true,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

reportSchema.index({ status: 1, created_at: -1 });
reportSchema.index({ reporter_user_id: 1, target_id: 1, status: 1 });

export const Report = registerModel<IReport>('Report', reportSchema);
