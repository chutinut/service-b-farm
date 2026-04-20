import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUserDecorator } from "../../common/decorators/current-user.decorator";
import { CurrentUser } from "../../common/interfaces/current-user.interface";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { FilterArticlesDto } from "./dto/filter-articles.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import {
  ArticleResponse,
  PaginatedArticlesResponse,
} from "./interfaces/article-response.interface";

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getPublicArticles(
    @Query() filters: FilterArticlesDto,
  ): Promise<PaginatedArticlesResponse> {
    return this.articlesService.getPublicArticles(filters);
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard)
  async getAdminArticles(
    @Query() filters: FilterArticlesDto,
  ): Promise<PaginatedArticlesResponse> {
    return this.articlesService.getAdminArticles(filters);
  }

  @Get("admin/:id")
  @UseGuards(JwtAuthGuard)
  async getAdminArticleById(@Param("id") id: string): Promise<ArticleResponse> {
    return this.articlesService.getAdminArticleById(id);
  }

  @Get(":id")
  async getPublicArticleById(
    @Param("id") id: string,
  ): Promise<ArticleResponse> {
    return this.articlesService.getPublicArticleById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @Body() payload: CreateArticleDto,
    @CurrentUserDecorator() user: CurrentUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.createArticle(payload, user);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @Param("id") id: string,
    @Body() payload: UpdateArticleDto,
    @CurrentUserDecorator() user: CurrentUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.updateArticle(id, payload, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @Param("id") id: string,
    @CurrentUserDecorator() user: CurrentUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.softDeleteArticle(id, user);
  }
}
