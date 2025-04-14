import { Injectable } from '@nestjs/common';

@Injectable()
export class Oauth2Service {
  getHello(): string {
    return 'Hello World!';
  }
}
