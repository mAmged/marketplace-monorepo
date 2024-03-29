import { AddressEntity, UserEntity } from '@commerce/users';
import { Field, ObjectType, PickType } from '@nestjs/graphql';

@ObjectType()
export class UserSchema extends PickType(UserEntity, [
  'id',
  'name',
  'seller',
  'email',
]) {
  @Field({ nullable: true })
  address: AddressEntity;
}
