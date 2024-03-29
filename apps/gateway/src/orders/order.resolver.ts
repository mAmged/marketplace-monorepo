import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import {
  Resolver,
  Context,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  config,
  ProductDTO,
  UserDTO,
} from '@commerce/shared';
import { UserEntity } from '@commerce/users';
import { ProductEntity } from '@commerce/products';
import { OrderEntity } from '@commerce/orders';
import { AuthGuard } from '../middlewares/auth.guard';
import { CreateOrderInput } from './input/create-order.input';
import { OrderProductDataLoader } from '../loaders/order-product.loader';
import { OrderService } from './order.service';
import { UUID } from '../shared/validation/uuid.validation';
import { UserDataLoader } from '../loaders/user.loader';
// import { Order, ProductInput } from "../schemas/graphql";
import { OrderSchema } from './schema/order.schema';
import { ProductSchema } from '../products/schema/product.schema';

@Resolver(()=> OrderSchema)
export class OrderResolver {
  @Client({
    transport: Transport.REDIS,
    options: {
      url: `redis://${config.REDIS_URL}:${config.REDIS_PORT}`,
    },
  })
  private client: ClientProxy;

  constructor(
    private readonly orderService: OrderService,
    private readonly usersDataLoader: UserDataLoader,
    private readonly orderProductLoader: OrderProductDataLoader,
  ) {}
  @ResolveField(() => UserEntity)
  async user(@Parent() order: OrderSchema): Promise<UserDTO> {
    return this.usersDataLoader.load(order.user_id);
  }
  @Query(returns => OrderSchema)
  @UseGuards(new AuthGuard())
  orders(@Context('user') user: any): Promise<OrderSchema[]> {
    return this.orderService.indexOrdersByUser(user.id);
  }
  @Mutation(returns => OrderSchema)
  @UseGuards(new AuthGuard())
  deleteOrder(@Args('id') id: string, @Context('user') user: any) {
    return this.orderService.destroyUserOrder(id, user.id);
  }
  @Mutation(returns => OrderSchema)
  @UseGuards(new AuthGuard())
  createOrder(
    @Args('products', { type: () => [CreateOrderInput] })
    products: CreateOrderInput[],
    @Context('user') user: any,
  ): Promise<ProductEntity[]> {
    return this.orderService.createOrder(products, user);
  }
}
