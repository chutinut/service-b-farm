import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ArticleStatus } from "../../../common/enums/article-status.enum";
import { FilterArticlesDto } from "../dto/filter-articles.dto";
import { Article, ArticleDocument } from "../schemas/article.schema";

interface FindManyParams {
  filters: FilterArticlesDto;
  adminMode: boolean;
}

@Injectable()
export class ArticleRepository {
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>,
  ) {}

  async findMany(
    params: FindManyParams,
  ): Promise<{ items: ArticleDocument[]; total: number }> {
    const { filters, adminMode } = params;
    const query: Record<string, unknown> = {};

    if (adminMode) {
      if (filters.status) {
        query.status = filters.status;
      }
    } else {
      query.status = ArticleStatus.PUBLISHED;
    }

    if (filters.keyword) {
      const regex = new RegExp(filters.keyword, "i");
      query.title = regex;
    }

    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.articleModel
        .find(query)
        .sort({ updated_date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments(query).exec(),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<ArticleDocument | null> {
    return this.articleModel.findById(id).exec();
  }

  async create(payload: Partial<Article>): Promise<ArticleDocument> {
    const article = new this.articleModel(payload);
    return article.save();
  }

  async updateById(
    id: string,
    payload: Partial<Article>,
  ): Promise<ArticleDocument | null> {
    return this.articleModel
      .findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      })
      .exec();
  }
}
