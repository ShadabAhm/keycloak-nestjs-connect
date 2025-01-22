import { Module } from '@nestjs/common';
import { AuthGuard, KeycloakConnectModule, ResourceGuard } from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config'; 
import { KeycloakConfigService } from './config/keycloak-config.service'; 
import { APP_GUARD } from '@nestjs/core';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { RoleGuard } from './guards/role.guard';
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
      imports:[ConfigModule]
    }),
    UsersModule,
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService, UsersService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  
})
export class AppModule {}
