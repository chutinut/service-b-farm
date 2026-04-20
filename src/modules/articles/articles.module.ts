import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";
import { ArticleRepository } from "./repositories/article.repository";
import { Article, ArticleSchema } from "./schemas/article.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleRepository],
  exports: [ArticlesService],
})
export class ArticlesModule {}
