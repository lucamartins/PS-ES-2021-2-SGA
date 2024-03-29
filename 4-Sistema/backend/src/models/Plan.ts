import { Schema, model, Types } from 'mongoose';

interface IPlan {
  name: string;
  active: boolean;
  modality: Types.ObjectId;
  numberLessonsWeek: number;
  monthPrice: number;
  monthDuration: number;
}

const PlanSchema = new Schema<IPlan>({
  name: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  modality: {
    type: Types.ObjectId,
    required: true,
  },
  numberLessonsWeek: {
    type: Number,
    required: true,
  },
  monthDuration: {
    type: Number,
    required: true,
  },
  monthPrice: {
    type: Number,
    required: true,
  },
});

export const Plan = model<IPlan>('Plan', PlanSchema);
