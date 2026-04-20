import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { ArticleStatus } from "../../../common/enums/article-status.enum";
import { IsBase64Image } from "../../../common/validators/is-base64-image.validator";

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(ArticleStatus)
  status!: ArticleStatus;

  @IsOptional()
  @IsBase64Image()
  bannerImage?: string;
}
