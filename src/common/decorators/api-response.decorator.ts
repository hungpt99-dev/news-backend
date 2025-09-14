import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export function ApiResponseDecorator(
  status: number,
  description: string,
  options?: ApiResponseOptions,
) {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      ...options,
    }),
  );
}

export const ApiOkResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(200, description, options);

export const ApiCreatedResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(201, description, options);

export const ApiNoContentResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(204, description, options);

export const ApiBadRequestResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(400, description, options);

export const ApiUnauthorizedResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(401, description, options);

export const ApiForbiddenResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(403, description, options);

export const ApiNotFoundResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(404, description, options);

export const ApiConflictResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(409, description, options);

export const ApiInternalServerErrorResponse = (description: string, options?: ApiResponseOptions) =>
  ApiResponseDecorator(500, description, options);
