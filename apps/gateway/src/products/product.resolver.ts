import { Client, ClientProxy, Transport } from "@nestjs/microservices";
import { ProductDTO, UserDTO, config } from "@commerce/shared";
import {
    Query,
    Resolver,
    Context,
    Mutation,
    Args,
    ResolveField,
    Parent
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";

import { AuthGuard } from "../middlewares/auth.guard";
import { ProductService } from "./product.service";
import { SellerGuard } from "../middlewares/seller.guard";
import { UserDataLoader } from "../loaders/user.loader";
import { UserEntity } from "@commerce/users";
import { ProductEntity } from "@commerce/products";
import { Roles } from "../decorators/roles.decorator";
import { MeSchema } from "../users/schema/me.schema";
import { CreateProductInput } from "./input/create-product.input";

@Resolver(()=> CreateProductInput)
export class ProductResolver {
    constructor(
        private readonly productService: ProductService,
        private readonly usersDataLoader: UserDataLoader
    ) {}
    
    @ResolveField(returns=> MeSchema)
    async user(@Parent() product: ProductDTO): Promise<UserDTO> {
        return this.usersDataLoader.load(product.user.id.toString());
    }
    @Query(returns=> [ProductEntity])
    products(): Promise<ProductEntity[]> {
        return this.productService.get();
    }
    @Query(returns=> ProductEntity)
    async showProduct(@Args("id") id: string) {
        return this.productService.show(id);
    }

    @Mutation(returns=> ProductEntity)
    @Roles("admin")
    @UseGuards(new AuthGuard(), new SellerGuard())
    async createProduct(
        @Args("data") data: CreateProductInput,
        @Context("user") user: any
    ) {
        const p: ProductEntity = await this.productService.store(data, user.id);;
        console.log('pp:',p);
        p.created_at = new Date(p.created_at);
        return p;

    }
    @Mutation(returns=> ProductEntity)
    @UseGuards(new AuthGuard(), new SellerGuard())
    async updateProduct(
        @Args("data") data: CreateProductInput,
        @Context("user") user: any,
        @Args("id") id: string
    ) {
        return this.productService.update(data, id, user.id);
    }
    @Mutation(returns=> ProductEntity)
    @UseGuards(new AuthGuard(), new SellerGuard())
    async deleteProduct(@Context("user") user: any, @Args("id") id: string) {
        return this.productService.destroy(id, user.id);
    }
}
