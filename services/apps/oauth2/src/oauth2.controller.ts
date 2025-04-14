import { Controller, Get } from '@nestjs/common';
import { Oauth2Service } from './oauth2.service';

@Controller()
export class Oauth2Controller {
  constructor(private readonly oauth2Service: Oauth2Service) {}

  @Get()
  getHello(): string {
    return this.oauth2Service.getHello();
  }
}
