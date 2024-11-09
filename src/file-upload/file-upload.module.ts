import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { UniversitiesModule } from 'src/universities/universities.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { ProfilesModule } from 'src/profiles/profiles.module';

@Module({
  imports: [UniversitiesModule, CompaniesModule, ProfilesModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
