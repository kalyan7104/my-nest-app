import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { VerificationToken } from './verification-token.entity';
import { randomUUID } from 'crypto';

import { VerificationStatus } from '../common/enums/verification-status.enum';

import { Profile } from './profile.entity';
import { Specialization } from './specialization.entity';


@Injectable()
export class DoctorsService {
 
constructor(
  @InjectRepository(Doctor)
  private doctorRepo: Repository<Doctor>,

  @InjectRepository(VerificationToken)
  private verificationRepo: Repository<VerificationToken>,

  @InjectRepository(Profile)
  private profileRepo: Repository<Profile>,

  @InjectRepository(Specialization)
  private specializationRepo: Repository<Specialization>,
) {}

  async requestVerification(userId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    const token = this.verificationRepo.create({
  doctor,
  token: randomUUID(),
});


    await this.verificationRepo.save(token);

    return { message: 'Verification request submitted' };
  }
async verifyDoctor(doctorId: number,status: VerificationStatus) {
  const doctor = await this.doctorRepo.findOne({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  doctor.verificationStatus = status;
  await this.doctorRepo.save(doctor);

  await this.verificationRepo.update(
    { doctor: { id: doctorId } },
    { status },
  );

  return { message: `Doctor ${status.toLowerCase()}` };
}
async upsertProfile(userId: number, data: any) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  if (doctor.verificationStatus !== VerificationStatus.APPROVED) {
    throw new BadRequestException('Doctor not approved');
  }

  const existingProfile = await this.profileRepo.findOne({
    where: { doctor: { id: doctor.id } },
  });

  let profileToSave: Profile;

  if (!existingProfile) {
    profileToSave = this.profileRepo.create({
      doctor: doctor,
      bio: data.bio,
      experienceYears: data.experienceYears,
      consultationFee: data.consultationFee,
      consultationHours: data.consultationHours,
    });
  } else {
    profileToSave = existingProfile;
    profileToSave.bio = data.bio;
    profileToSave.experienceYears = data.experienceYears;
    profileToSave.consultationFee = data.consultationFee;
    profileToSave.consultationHours = data.consultationHours;
  }

  await this.profileRepo.save(profileToSave);

  return { message: 'Profile saved successfully' };
}


async addSpecialization(userId: number, name: string) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  if (!doctor) {
    throw new BadRequestException('Doctor not found');
  }

  if (doctor.verificationStatus !== VerificationStatus.APPROVED) {
    throw new BadRequestException('Doctor not approved');
  }

  const specialization = this.specializationRepo.create({
    doctor,
    name,
  });

  await this.specializationRepo.save(specialization);

  return { message: 'Specialization added successfully' };
}



}
