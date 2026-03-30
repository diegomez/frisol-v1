import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TribesModule } from './tribes/tribes.module';
import { ProjectsModule } from './projects/projects.module';
import { SymptomsModule } from './symptoms/symptoms.module';
import { CausasModule } from './causas/causas.module';
import { KpisModule } from './kpis/kpis.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'frisol',
      password: process.env.DATABASE_PASSWORD || 'frisol',
      database: process.env.DATABASE_NAME || 'frisol',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    TribesModule,
    ProjectsModule,
    SymptomsModule,
    CausasModule,
    KpisModule,
    AttachmentsModule,
    PdfModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
