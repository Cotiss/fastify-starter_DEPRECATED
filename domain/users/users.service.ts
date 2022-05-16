import { expose, Service } from '../../core/service';
import { QueryOptions } from "mongoose";
import { Users } from './users.models';

export class UsersService extends Service {
  public serviceName = 'UsersService';

  async getByEmail(email: string, options?: QueryOptions<typeof Users>) {
    try {
      const user = await Users
        .findOne({ email }, null, options);
      if (!user) {
        throw new Error('Cannot find user by email');
      }
      return user;
    } catch (error) {
      this.instance.log.error(error);
      throw new Error('Failed retrieving User by email');
    }
  }

  async getById(id: string, options?: QueryOptions<typeof Users>) {
    try {
      const user = await Users.findById(id, null, options);
      if (!user) {
        throw new Error(`Cannot find user by id: "${id}"`);
      }
      return user;
    } catch (error) {
      this.instance.log.error(error);
      throw new Error('Failed retrieving User by id');
    }
  }

  async update(id: string, payload: Partial<typeof Users>) {
    return await Users.findByIdAndUpdate(id, payload);
  }
}

export default expose(UsersService);
