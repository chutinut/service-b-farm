import { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ArticleStatus } from "../../../common/enums/article-status.enum";

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ collection: "articles", versionKey: false })
export class Article {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: false, trim: true, maxlength: 500, default: "" })
  excerpt!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ArticleStatus),
    default: ArticleStatus.DRAFT,
  })
  status!: ArticleStatus;

  @Prop({ required: false, type: String, default: null })
  banner_image!: string | null;

  @Prop({ required: true })
  created_by!: string;

  @Prop({ required: true, default: () => new Date() })
  created_date!: Date;

  @Prop({ required: true })
  updated_by!: string;

  @Prop({ required: true, default: () => new Date() })
  updated_date!: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ status: 1, updated_date: -1 });
ArticleSchema.index({ title: "text" });
