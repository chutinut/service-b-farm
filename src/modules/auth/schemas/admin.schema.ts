import { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ collection: "admins", versionKey: false })
export class Admin {
  @Prop({ required: true, unique: true, trim: true })
  username!: string;

  @Prop({ required: true })
  password_hash!: string;

  @Prop({ required: true, default: () => new Date() })
  created_date!: Date;

  @Prop({ required: true, default: () => new Date() })
  updated_date!: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
