import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class KeycloakAdminService {
  private readonly keycloakServerUrl = 'http://localhost:8080';
  private readonly realmName = 'my-realm';
  private readonly clientId = 'admin-cli';
  private readonly adminUsername = 'admin'; // Keycloak Admin Username
  private readonly adminPassword = 'admin'; // Keycloak Admin Password

  constructor(private readonly httpService: HttpService) {}

  async getAdminAccessToken(): Promise<string> {
    const url = `${this.keycloakServerUrl}/realms/${this.realmName}/protocol/openid-connect/token`;

    const payload = new URLSearchParams({
      client_id: this.clientId,
      username: this.adminUsername,
      password: this.adminPassword,
      grant_type: 'password',
    });

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, payload.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      return response.data.access_token;
    } catch (error) {
      throw new HttpException(
        'Failed to obtain Keycloak Admin token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Create User in Keycloak
  async createUser(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    roles: string[],
  ): Promise<any> {
    const adminToken = await this.getAdminAccessToken();
    const url = `${this.keycloakServerUrl}/admin/realms/${this.realmName}/users`;

    const userPayload = {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false, // Set to `true` if the user must change the password on first login
        },
      ],
    };

    try {
      // Create user
      const response = await this.httpService
        .post(url, userPayload, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        })
        .toPromise();

      // Assign roles to the user if provided
      if (roles.length > 0) {
        await this.assignRolesToUser(adminToken, username, roles);
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to create user: ${error.response?.data || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Assign roles to the user
  async assignRolesToUser(adminToken: string, username: string, roles: string[]): Promise<void> {
    // Fetch user by username to get the user ID
    const usersUrl = `${this.keycloakServerUrl}/admin/realms/${this.realmName}/users?username=${username}`;
    const userResponse = await this.httpService
      .get(usersUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .toPromise();

    const userId = userResponse.data[0]?.id;

    if (!userId) {
      throw new HttpException('User not found in Keycloak', HttpStatus.NOT_FOUND);
    }

    // Fetch client to get its ID
    const clientsUrl = `${this.keycloakServerUrl}/admin/realms/${this.realmName}/clients`;
    const clientResponse = await this.httpService
      .get(clientsUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .toPromise();

    const client = clientResponse.data.find((c) => c.clientId === 'nestjs-app');
    const clientId = client?.id;

    if (!clientId) {
      throw new HttpException('Client not found in Keycloak', HttpStatus.NOT_FOUND);
    }

    // Fetch available roles for the client
    const rolesUrl = `${this.keycloakServerUrl}/admin/realms/${this.realmName}/clients/${clientId}/roles`;
    const rolesResponse = await this.httpService
      .get(rolesUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .toPromise();

    const rolesToAssign = rolesResponse.data.filter((role) => roles.includes(role.name));

    // Assign roles to the user
    const assignRolesUrl = `${this.keycloakServerUrl}/admin/realms/${this.realmName}/users/${userId}/role-mappings/clients/${clientId}`;
    await this.httpService
      .post(assignRolesUrl, rolesToAssign, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      .toPromise();
  }
}
