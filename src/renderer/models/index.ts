import { Models } from '@rematch/core';
import { user } from './user';
import { note } from './note';
import { publish } from './publish';

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  note: typeof note;
  publish: typeof publish;
}

export const models: RootModel = {
  user,
  note,
  publish,
};
