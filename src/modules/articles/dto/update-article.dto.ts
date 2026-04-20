import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { ArticleStatus } from "../../../common/enums/article-status.enum";
import { IsBase64Image } from "../../../common/validators/is-base64-image.validator";

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsBase64Image()
  bannerImage?: string;
}
