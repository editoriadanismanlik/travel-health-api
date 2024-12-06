import { Request, Response, NextFunction } from 'express';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: { [key: string]: any };
}

export interface PaginatedRequest extends Request {
  pagination: {
    page: number;
    limit: number;
    skip: number;
    sort: { [key: string]: 1 | -1 };
    search?: string;
    filter?: { [key: string]: any };
  };
}

export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query as unknown as PaginationQuery;
  
  const page = Math.max(1, parseInt(query.page?.toString() || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit?.toString() || '10')));
  const skip = (page - 1) * limit;
  
  const sort = query.sort || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;
  
  const search = query.search;
  let filter = {};
  
  if (query.filter) {
    try {
      filter = typeof query.filter === 'string' 
        ? JSON.parse(query.filter)
        : query.filter;
    } catch (error) {
      filter = {};
    }
  }

  (req as PaginatedRequest).pagination = {
    page,
    limit,
    skip,
    sort: { [sort]: order },
    search,
    filter
  };

  next();
};
