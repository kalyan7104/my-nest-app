import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  create(user: Partial<User>) {
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByPhone(phone: string) {
    return this.repo.findOne({ where: { phone } });
  }

  async verifyUser(userId: number) {
  await this.repo.update(userId, { isVerified: true });
}

}
