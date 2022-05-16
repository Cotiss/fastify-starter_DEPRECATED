import { Schema, model } from 'mongoose';
import { RoleNames } from "../../constants/permissions";

export const UsersSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String, 
    required: true, 
    select: false,
  },
  permissions: {
    type: String,
    enum: [RoleNames.USER, RoleNames.ADMIN],
    default: RoleNames.USER,
    required: true,
  },
}, {
  timestamps: true,
});

export const Users = model('Users', UsersSchema);
