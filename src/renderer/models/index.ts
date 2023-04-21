import { Models } from '@rematch/core';
import { user } from './user';
import { note } from './note';
import { publish } from './publish';
import { space } from './space';
import { sys } from './sys';

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  note: typeof note;
  publish: typeof publish;
  space: typeof space;
  sys: typeof sys;
}

export const models: RootModel = {
  user,
  note,
  publish,
  space,
  sys,
};
