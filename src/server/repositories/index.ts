import { config } from '../config';
import {
  InMemoryCityRepository,
  InMemoryInstitutionRepository,
  InMemoryReviewRepository,
  InMemoryUserRepository
} from './inMemoryRepositories';
import {
  PrismaCityRepository,
  PrismaInstitutionRepository,
  PrismaReviewRepository,
  PrismaUserRepository
} from './prismaRepositories';
import { ICityRepository, IInstitutionRepository, IReviewRepository, IUserRepository } from './interfaces';

class RepositoryFactory {
  private institutionRepo: IInstitutionRepository;
  private cityRepo: ICityRepository;
  private reviewRepo: IReviewRepository;
  private userRepo: IUserRepository;

  constructor() {
    if (config.databaseUrl) {
      console.log('⚡ Initializing Prisma Repositories connected to Neon DB');
      this.institutionRepo = new PrismaInstitutionRepository();
      this.cityRepo = new PrismaCityRepository();
      this.reviewRepo = new PrismaReviewRepository();
      this.userRepo = new PrismaUserRepository();
    } else {
      console.log('ℹ️ Initializing In-Memory Repositories from seed data');
      this.institutionRepo = new InMemoryInstitutionRepository();
      this.cityRepo = new InMemoryCityRepository();
      this.reviewRepo = new InMemoryReviewRepository();
      this.userRepo = new InMemoryUserRepository();
    }
  }

  getInstitutionRepository(): IInstitutionRepository {
    return this.institutionRepo;
  }

  getCityRepository(): ICityRepository {
    return this.cityRepo;
  }

  getReviewRepository(): IReviewRepository {
    return this.reviewRepo;
  }

  getUserRepository(): IUserRepository {
    return this.userRepo;
  }
}

export const repositoryFactory = new RepositoryFactory();
