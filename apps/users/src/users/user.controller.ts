import { Controller } from '@nestjs/common';
import { LoginUserInput } from '@commerce/gateway';
import { RegisterUserInput } from '@commerce/gateway';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { ObjectID } from 'typeorm';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}
  @MessagePattern('users')
  index() {
    return this.users.get();
  }
  @MessagePattern('login-user')
  login(data: LoginUserInput) {
    return this.users.login(data);
  }
  @MessagePattern('register-user')
  register(data: RegisterUserInput) {
    return this.users.register(data);
  }
  @MessagePattern('current-loggedin-user')
  me(id: ObjectID) {
    return this.users.me({ id });
  }
  @MessagePattern('fetch-user-by-id')
  fetchUserById(id: string) {
    return this.users.findById(id);
  }
  @MessagePattern('fetch-users-by-ids')
  fetchUsersByIds(ids: Array<String>) {
    return this.users.fetchUsersByIds(ids);
  }
  @EventPattern('customer_created')
  handleCreatedCustomer({ user_id, gateway_customer_id }) {
    return this.users.updateToCustomer(user_id, gateway_customer_id);
  }
}
