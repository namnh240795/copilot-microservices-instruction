import { Test, TestingModule } from '@nestjs/testing';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';

describe('Oauth2Controller', () => {
  let oauth2Controller: Oauth2Controller;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [Oauth2Controller],
      providers: [Oauth2Service],
    }).compile();

    oauth2Controller = app.get<Oauth2Controller>(Oauth2Controller);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(oauth2Controller.getHello()).toBe('Hello World!');
    });
  });
});
