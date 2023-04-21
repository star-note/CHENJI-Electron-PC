import { Note } from '../note.interface';

type ISecondNode = {
  note: Note;
  active: boolean;
};
export const NoteCardItem = (props: ISecondNode) => {
  const { note, active = false } = props;
  return (
    <div className={`note-card ${active ? 'note-card-active' : ''}`}>
      <p className="title">{note.title}</p>
      <p className="description">{note.content}</p>
      <p className="time">{note.modifyTime}</p>
    </div>
  );
};
