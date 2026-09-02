import {
  InMemoryCityRepository,
  InMemoryInstitutionRepository,
  InMemoryReviewRepository,
  InMemoryUserRepository
} from './inMemoryRepositories';
import { ICityRepository, IInstitutionRepository, IReviewRepository, IUserRepository } from './interfaces';

class RepositoryFactory {
  private institutionRepo: IInstitutionRepository;
  private cityRepo: ICityRepository;
  private reviewRepo: IReviewRepository;
  private userRepo: IUserRepository;

  constructor() {
    // In current configuration, initialize with in-memory repositories populated from seed data.
    // When DATABASE_URL is configured for Neon, Prisma repository implementations can be swapped seamlessly.
    this.institutionRepo = new InMemoryInstitutionRepository();
    this.cityRepo = new InMemoryCityRepository();
    this.reviewRepo = new InMemoryReviewRepository();
    this.userRepo = new InMemoryUserRepository();
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
