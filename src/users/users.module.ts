import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

@Module({
  // imports: [KeycloakConnectModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
