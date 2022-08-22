import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 999999), email, password } as User
        users.push(user);
        return Promise.resolve(user);
      },
    }
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        }
      ]
    }).compile();
  
    service = module.get(AuthService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test1@test.com', 'heslo1');
    expect(user.password).not.toEqual('heslo1');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email already in use', async () => {
    await service.signup('test2@test.com', 'heslo2');

    const promise = service.signup('test2@test.com', 'heslo2');
    expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('throws an error if signin is called with an unused email', () => {
    const promise = service.signin('test2@test.com', 'heslo2');
    expect(promise).rejects.toThrowError(BadRequestException);
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signup('darth@vader.com', 'sith');

    const promise = service.signin('darth@vader.com', 'jedi');
    expect(promise).rejects.toThrowError(BadRequestException);
  })

  it('returns a user if correct password is provided', async () => {
    await service.signup('darth@vader.com', 'sith');

    const user = await service.signin('darth@vader.com', 'sith');
    expect(user).toBeDefined();
  });
});