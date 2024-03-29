import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
const ormconfig = require('../ormconfig.json');
@Module({
  imports: [TypeOrmModule.forRoot(ormconfig[0]), UsersModule],
})
export class AppModule {}
