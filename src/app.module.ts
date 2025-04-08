import { KeycloakAdminModule } from './keycloak-admin/keycloak-admin.module';
import { Module } from '@nestjs/common';
import { AuthGuard, KeycloakConnectModule, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; 
import { KeycloakConfigService } from './config/keycloak-config.service'; 
import { APP_GUARD } from '@nestjs/core';
import { UsersController } from './employees/users.controller';
import { UsersModule } from './employees/users.module';
import { UsersService } from './employees/users.service';
import { KeycloakAdminController } from './keycloak-admin/keycloak-admin.controller';
// import { RoleGuard } from './guards/role.guard';
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
      imports:[ConfigModule]
    }),
    UsersModule, KeycloakAdminModule
  ],
  controllers: [AppController, UsersController, KeycloakAdminController],
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
