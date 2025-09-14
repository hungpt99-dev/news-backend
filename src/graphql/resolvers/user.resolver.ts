import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RegisterDto } from '../../auth/dto/register.dto';
import { LoginDto } from '../../auth/dto/login.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Query(() => [User])
  async users() {
    return this.usersService.findAll({ page: 1, limit: 100 });
  }

  @Query(() => User)
  async user(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  async userByUsername(@Args('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => String)
  async register(@Args('input') input: RegisterDto) {
    const result = await this.authService.register(input);
    return result.accessToken;
  }

  @Mutation(() => String)
  async login(@Args('input') input: LoginDto) {
    const result = await this.authService.login(input);
    return result.accessToken;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Args('input') input: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.updateProfile(user.id, input);
  }
}
