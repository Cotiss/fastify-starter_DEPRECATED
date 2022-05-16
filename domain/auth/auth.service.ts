import { expose, Service } from "../../core/service";
import bcrypt from 'bcrypt';
import { Errors } from "./auth.constants";
import { RoleNames } from "../../constants/permissions";

export class AuthService extends Service {
  public serviceName = 'AuthService';

  async login(email: string, password: string) {
    const user = await this.instance.UsersService.getByEmail(email, { select: '+password' });

    const hasAccess = await bcrypt.compare(password, user.password);
    if (!hasAccess) {
      throw new Error(Errors.INVALID_CREDENTIALS);
    }
    
    const accessToken = this.createAccessToken(user.id);
    return {
      accessToken,
    };
  }

  private createAccessToken(userId: string, roles: unknown[] = []) {
    return this.instance.jwt.sign(
      {
        id: userId,
        roles: [...roles, RoleNames.USER],
      },
      {
        expiresIn: '1h',
      }
    );
  }

}

export default expose(AuthService);
