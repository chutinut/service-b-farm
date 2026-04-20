import { ArticleStatus } from "../../../common/enums/article-status.enum";

export interface ArticleResponse {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  bannerImage: string | null;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
}

export interface PaginatedArticlesResponse {
  items: ArticleResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
