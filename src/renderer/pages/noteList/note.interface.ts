export interface Note {
  noteId: number;
  parentId?: number;
  userId: number;
  title?: string;
  content?: string;
  createTime: string;
  modifyTime: string;
  childNodes?: Note[];
}

export type NotesTree = Note[];

export interface ActiveNote {
  noteId: number;
  parentId?: number;
  title?: string;
  content?: string;
}
