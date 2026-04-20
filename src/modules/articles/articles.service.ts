import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import {
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
} from "../../common/utils/case-converter.util";
import { CurrentUser } from "../../common/interfaces/current-user.interface";
import { ArticleStatus } from "../../common/enums/article-status.enum";
import { CreateArticleDto } from "./dto/create-article.dto";
import { FilterArticlesDto } from "./dto/filter-articles.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import {
  ArticleResponse,
  PaginatedArticlesResponse,
} from "./interfaces/article-response.interface";
import { ArticleRepository } from "./repositories/article.repository";
import { Article, ArticleDocument } from "./schemas/article.schema";

@Injectable()
export class ArticlesService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getAdminArticles(
    filters: FilterArticlesDto,
  ): Promise<PaginatedArticlesResponse> {
    const result = await this.articleRepository.findMany({
      filters,
      adminMode: true,
    });

    return {
      items: result.items.map((item) => this.toArticleResponse(item)),
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.limit),
    };
  }

  async getPublicArticles(
    filters: FilterArticlesDto,
  ): Promise<PaginatedArticlesResponse> {
    const result = await this.articleRepository.findMany({
      filters,
      adminMode: false,
    });

    return {
      items: result.items.map((item) => this.toArticleResponse(item)),
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.limit),
    };
  }

  async getAdminArticleById(id: string): Promise<ArticleResponse> {
    this.validateMongoId(id);

    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return this.toArticleResponse(article);
  }

  async getPublicArticleById(id: string): Promise<ArticleResponse> {
    this.validateMongoId(id);

    const article = await this.articleRepository.findById(id);
    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException("Article not found");
    }

    return this.toArticleResponse(article);
  }

  async createArticle(
    payload: CreateArticleDto,
    user: CurrentUser,
  ): Promise<ArticleResponse> {
    const now = new Date();
    const dbPayload = convertKeysToSnakeCase({
      ...payload,
      createdBy: user.username,
      createdDate: now,
      updatedBy: user.username,
      updatedDate: now,
    }) as Partial<Article>;
    const article = await this.articleRepository.create(dbPayload);

    return this.toArticleResponse(article);
  }

  async updateArticle(
    id: string,
    payload: UpdateArticleDto,
    user: CurrentUser,
  ): Promise<ArticleResponse> {
    this.validateMongoId(id);

    const dbPayload = convertKeysToSnakeCase({
      ...payload,
      updatedBy: user.username,
      updatedDate: new Date(),
    }) as Partial<Article>;
    const article = await this.articleRepository.updateById(id, dbPayload);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return this.toArticleResponse(article);
  }

  async softDeleteArticle(
    id: string,
    user: CurrentUser,
  ): Promise<ArticleResponse> {
    this.validateMongoId(id);

    const dbPayload = convertKeysToSnakeCase({
      status: ArticleStatus.DELETED,
      updatedBy: user.username,
      updatedDate: new Date(),
    }) as Partial<Article>;
    const article = await this.articleRepository.updateById(id, dbPayload);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return this.toArticleResponse(article);
  }

  private toArticleResponse(article: ArticleDocument): ArticleResponse {
    const articleData = convertKeysToCamelCase(
      article.toObject(),
    ) as unknown as {
      title: string;
      excerpt: string;
      content: string;
      status: ArticleStatus;
      bannerImage?: string | null;
      createdBy: string;
      createdDate: Date;
      updatedBy: string;
      updatedDate: Date;
    };

    return {
      id: article.id,
      title: articleData.title,
      excerpt: articleData.excerpt,
      content: articleData.content,
      status: articleData.status,
      bannerImage: articleData.bannerImage ?? null,
      createdBy: articleData.createdBy,
      createdDate: articleData.createdDate,
      updatedBy: articleData.updatedBy,
      updatedDate: articleData.updatedDate,
    };
  }

  private validateMongoId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Article not found");
    }
  }
}
