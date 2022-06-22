import { UserInfo } from '@/utils';

export interface Login {
  request: {
    mobile: string;
    password: string;
  };
  response: UserInfo | undefined;
}
