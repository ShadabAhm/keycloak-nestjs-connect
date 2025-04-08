import { Module } from '@nestjs/common';
import { KeycloakAdminService } from './keycloak-admin.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [KeycloakAdminService],
  exports: [KeycloakAdminService],
})
export class KeycloakAdminModule {}
