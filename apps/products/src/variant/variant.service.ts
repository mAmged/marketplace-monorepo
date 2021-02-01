import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeleteResult,
  FindManyOptions,
  getRepository,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { VariantEntity } from './variant.entity';
import { CreateVariantInput } from '@commerce/gateway';
import { ProductEntity } from '../products/product.entity';
import { ProductService } from '../products/product.service';
import { UpdateVariantInput } from '@commerce/gateway';
import { Stockservice } from '../stocks/stock.service';

@Injectable()
export class Variantservice {
  constructor(
    @InjectRepository(VariantEntity)
    private readonly Variants: Repository<VariantEntity>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    @Inject(forwardRef(() => Stockservice))
    private stockservice: Stockservice,
  ) {}
  get(data: FindManyOptions = undefined): Promise<VariantEntity[]> {
    return this.Variants.find(data);
  }
  fetchVariantsByIds(ids: Array<string>) {
    return this.Variants.createQueryBuilder('Variants')
      .where(`Variants.id IN (:...ids)`, { ids })
      .getMany();
  }
  async store(variant: CreateVariantInput): Promise<any> {
    const newVariant = new VariantEntity();
    newVariant.name = variant.name;
    newVariant.price = variant.price;
    newVariant.description = variant.description;
    const product = await this.productService.show(variant.productId);
    newVariant.product = product; 
    return this.Variants.save(newVariant).then(async v=>{
      await this.productService.updateProductQuantity(variant.productId);
      return v;
    }).catch((error) => {
      throw new RpcException(new BadRequestException(error.message));
    });
  }

  async update(
    id: string,
    newVariantData: UpdateVariantInput,
    userId: string,
    ignoreUserValidation = false,
  ): Promise<VariantEntity> {
    const oldVariant = await this.Variants.findOneOrFail({
      where: { id },
      relations: ['product'],
    });
    if (
      ignoreUserValidation === true ||
      oldVariant.product.user_id === userId
    ) {
      await this.Variants.update(id, newVariantData);
      await this.productService.updateProductQuantity(oldVariant.product.id);
      return this.Variants.findOneOrFail({ id });
    }
    throw new RpcException(
      new NotFoundException("You cannot update what you don't own..."),
    );
  }
  show(id: string): Promise<VariantEntity> {
    return this.Variants.findOneOrFail({ id }).catch(() => {
      throw new RpcException(
        new NotFoundException('Variant cannot be found...'),
      );
    });
  }
  showVariantStock(id: string){
    return this.stockservice.getStockByVariantId(id);
  }
  async getProductByVariantId(id: string): Promise<ProductEntity> {
    const variant = await this.Variants.findOneOrFail({
      where: { id },
      relations: ['product'],
    }).catch(() => {
      throw new RpcException(
        new NotFoundException('Variant cannot be found...'),
      );
    });
    return variant.product;
  }
  async destroy(id: string, user_id: string): Promise<any> {
    const variant = await this.Variants.findOneOrFail({
      where: { id },
      relations: ['product'],
    }).catch(() => {
      throw new RpcException(
        new NotFoundException('Variant cannot be found...'),
      );
    });
    if (variant.product.user_id !== user_id)
      throw new RpcException(
        new NotFoundException("You cannot update what you don't own..."),
      );
    this.Variants.softRemove({ id }).catch(() => {
      throw new RpcException(
        new NotFoundException('Variant cannot be update...'),
      );
    });
    return variant;
  }
  async getVariantByProductId(id: string) {
    return this.Variants.find({
      where: {
        product: id,
      },
    });
  }
  async consumeVariant(productId: string, user_id: string) {
    let variant;
    try {
      variant = await this.Variants.findOneOrFail({
        where: {
          product: productId,
          // status: variantStatus.AVAILABLE,
        },
      });
    } catch (error) {
      return new RpcException(
        new NotFoundException('cannot find available variant'),
      );
    }
    // variant.status = variantStatus.CONSUMED;
    this.update(variant.id, variant, user_id);
    return variant;
  }
  async incrementVariantsVariant(Variants) {
    Variants.forEach((variant) => {
      this.Variants.increment({ id: variant.id }, 'quantity', variant.quantity);
    });
  }
}
