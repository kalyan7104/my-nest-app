import { TypeOrmModuleOptions } from '@nestjs/typeorm';

console.log('DB HOST:', process.env.DB_HOST);
console.log('DB PORT:', process.env.DB_PORT);
console.log('DB USERNAME:', process.env.DB_USERNAME);
console.log('DB PASSWORD:', process.env.DB_PASSWORD);
console.log('DB NAME:', process.env.DB_NAME);

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  autoLoadEntities: true,

  synchronize: true, // ⚠️ dev only
  logging: true,
};


