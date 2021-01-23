import { CreateVariantInput, UpdateVariantInput } from '@commerce/gateway';
import { ProductService } from '../products/product.service';
import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';

import { VariantEntity } from './variant.entity';
import { Variantservice } from './variant.service';

@Controller('Variants')
export class VariantController {
  constructor(private readonly Variants: Variantservice) {}

  @MessagePattern('Variants')
  index(data: any = undefined, arg2, arg3): Promise<VariantEntity[]> {
    return this.Variants.get(data);
  }

  @MessagePattern('create-variant')
  store(variant: CreateVariantInput): Promise<VariantEntity> {
    return this.Variants.store(variant);
  }

  @MessagePattern('update-variant')
  update({ variantId, variant, userId }): Promise<VariantEntity> {
    return this.Variants.update(variantId, variant, userId);
  }

  @MessagePattern('show-variant')
  show(id: string): Promise<VariantEntity> {
    return this.Variants.show(id);
  }
  @MessagePattern('get-product-by-variant-id')
  getVariantByProductId(id: string): Promise<VariantEntity> {
    return this.Variants.getProductByVariantId(id);
  }
  @MessagePattern('fetch-variants-by-ids')
  fetchVariantsByIds(ids: Array<string>) {
    return this.Variants.fetchVariantsByIds(ids);
  }
  @EventPattern('consume-variant')
  async handleOrderDeleted({ productId, user_id }: { productId: string; user_id: string }) {
    return this.Variants.consumeVariant(productId, user_id);
  }
  @MessagePattern('delete-variant')
  destroy({ id, user_id }: { id: string; user_id: string }) {
    return this.Variants.destroy(id, user_id);
  }
}
