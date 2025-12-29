declare module '@nestjs/passport' {
  export const PassportStrategy: any;
  export const PassportModule: any;
  export const AuthGuard: any;
}

declare module 'passport-jwt' {
  export const ExtractJwt: any;
  export const Strategy: any;
}
