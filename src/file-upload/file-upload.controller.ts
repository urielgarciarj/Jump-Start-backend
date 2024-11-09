import { Controller, Post, UseInterceptors, UploadedFile, Body, NotAcceptableException, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { CompaniesService } from 'src/companies/companies.service';
import { UniversitiesService } from 'src/universities/universities.service';

@Controller('file-upload')
export class FileUploadController {

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly universityService: UniversitiesService,
    private readonly companiesService: CompaniesService,
    private readonly profilesService: ProfilesService,
  ) {}

  @Post('profile-pic/:profileId')
  @UseInterceptors(FileInterceptor('file', {
    storage: FileUploadService.storageDestination('profile'),
    fileFilter: FileUploadService.imageFileFilter,
  }))
  async uploadProfilePic(@Param('profileId') profileId: string, @UploadedFile() file) {
    const profile = await this.profilesService.updateProfilePic(Number(profileId), file.path);
    return { message: 'Profile picture uploaded successfully!', file, profile };
  }

  @Post('university-logo/:universityId')
  @UseInterceptors(FileInterceptor('file', {
    storage: FileUploadService.storageDestination('university-logo'),
    fileFilter: FileUploadService.imageFileFilter,
  }))
  async uploadUniversityLogo(@Param('universityId') universityId: string, @UploadedFile() file) {
    const university = await this.universityService.updateLogo(Number(universityId), file.path);
    return { message: 'University logo uploaded successfully!', file, university };
  }

  @Post('company-logo/:companyId')
  @UseInterceptors(FileInterceptor('file', {
    storage: FileUploadService.storageDestination('company-logo'),
    fileFilter: FileUploadService.imageFileFilter,
  }))
  async uploadCompanyLogo(@Param('companyId') companyId: string, @UploadedFile() file) {
    const company = await this.companiesService.updateLogo(Number(companyId), file.path);
    return { message: 'Company logo uploaded successfully!', file, company };
  }
}
