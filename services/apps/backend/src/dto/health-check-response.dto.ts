import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ description: 'The status of the service', example: 'ok' })
  status: string;

  @ApiProperty({ description: 'The timestamp of the health check', example: '2025-04-14T12:00:00.000Z' })
  timestamp: string;
}