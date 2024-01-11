export interface Note {
  noteId: string | null; // 为null时是在新建笔记
  parentId?: string;
  userId?: string | null;
  title?: string | null;
  content?: string;
  createTime?: string;
  modifyTime?: string;
  childNodes?: Note[];
  spaceId?: string;
}

export type NotesTree = Note[];

export interface ActiveNote {
  noteId: string | null;
  parentId?: string;
  userId?: string;
  userName?: string;
  avatarUrl?: string;
  title?: string | null;
  content?: string;
  spaceId?: string;
  createTime?: string;
  modifyTime?: string;
  creator?: string;
  modifier?: string;
  creatorName?: string;
  creatorAvator?: string;
  modifierName?: string;
  modifierAvator?: string;
}

export interface Space {
  spaceId: string;
  parentSpace?: string;
  name: string;
  creator: string;
  owner?: string;
  title: string;
  createTime?: string;
  modifyTime?: string;
  cnt?: number;
}
