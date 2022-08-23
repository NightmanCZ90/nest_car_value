import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', async () => {
    const signupEmail = 'uniqueemail@unique.com';

    const { body: { id, email } } = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: signupEmail, password: 'uniquepassword' })
      .expect(201)

      expect(id).toBeDefined();
      expect(email).toEqual(signupEmail);
  });

  it('sign up as a new user then get the currently logged in user', async () => {
    const signupEmail = 'uniqueemail@unique.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: signupEmail, password: 'uniquepassword' })
      .expect(201)

    const cookie = res.get('Set-Cookie');

    const { body: { email } } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200)

    expect(email).toEqual(signupEmail);
  });
});
