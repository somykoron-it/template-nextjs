import { prop, getModelForClass } from '@typegoose/typegoose';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';

export class User {
  @prop({ default: () => nanoid(9) })
  _id: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true, unique: true })
  email: string;

  @prop({ required: false })
  password: string;

  @prop({ default: 'credentials' })
  provider: string;

  @prop({ required: false })
  password_reset_token: string;

  @prop({ default: () => new Date() })
  createdAt: Date;

  @prop({ default: () => new Date() })
  updatedAt: Date;
}

const UserModel = mongoose.models.User || getModelForClass(User);

export { UserModel };
