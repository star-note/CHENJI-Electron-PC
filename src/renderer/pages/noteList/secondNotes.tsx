import { useEffect } from 'react';
import { NoteCardItem } from './components/secondNote';
import { ActiveNote, Note, NotesTree, Space } from './note.interface';

type INoteCardList = {
  activeNoteId?: Note['noteId'];
  activeSpaceId?: Space['spaceId']; // 默认-1代表当前是个人笔记
};
export const NoteCardList = (props: INoteCardList) => {
  const {activeNoteId, activeSpaceId = '-1'} = props;
  useEffect(() => {

  }, [])
  return <NoteCardItem />;
};
