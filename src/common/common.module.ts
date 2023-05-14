import { Module } from '@nestjs/common';
import { AxiosAdapter } from './Adapter/Axios.adapter';

@Module({
  providers: [AxiosAdapter],
  exports: [AxiosAdapter],
})
export class CommonModule {}
