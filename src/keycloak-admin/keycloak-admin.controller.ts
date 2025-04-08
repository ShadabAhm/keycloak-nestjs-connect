import { Controller, Post, Body } from '@nestjs/common';
import { KeycloakAdminService } from './keycloak-admin.service';

@Controller('keycloak')
export class KeycloakAdminController {
  constructor(private readonly keycloakAdminService: KeycloakAdminService) {}

  @Post('create-user')
  async createUser(@Body() createUserDto: any) {
    const { username, email, firstName, lastName, password, roles } = createUserDto;
    return await this.keycloakAdminService.createUser(username, email, firstName, lastName, password, roles);
  }
}
