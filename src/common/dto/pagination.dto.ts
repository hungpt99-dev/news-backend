import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }

  get take(): number {
    return this.limit || 10;
  }
}

export class PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  constructor(data: T[], total: number, pagination: PaginationDto) {
    this.data = data;
    this.meta = {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total,
      totalPages: Math.ceil(total / (pagination.limit || 10)),
      hasNext: (pagination.page || 1) < Math.ceil(total / (pagination.limit || 10)),
      hasPrev: (pagination.page || 1) > 1,
    };
  }
}
