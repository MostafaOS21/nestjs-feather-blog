import { ApiProperty } from '@nestjs/swagger';

export class OKResponse<T> {
  @ApiProperty({ example: 'string' })
  message: string;

  data: T;
}
