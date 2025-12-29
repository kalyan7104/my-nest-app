import { UserRole, AuthProvider } from '../../common/enum';

export class SignupDto {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  provider: AuthProvider;
}
