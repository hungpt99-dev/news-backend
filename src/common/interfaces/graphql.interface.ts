import { User } from '../../entities/user.entity';

export interface GraphQLContext {
  user?: User;
  req: any;
  res: any;
}

export interface GraphQLRequest {
  headers: Record<string, string>;
  body: any;
  query: any;
  variables: any;
  operationName?: string;
}
