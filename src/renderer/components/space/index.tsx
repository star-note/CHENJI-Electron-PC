import { CSSProperties } from 'react';

export const LineSpace = ({
  height = 12,
  background = '#fff',
}: {
  height?: number | string;
  background?: string;
}) => <div style={{ height: `${height}px`, background }} />;
export const WidthSpace = ({
  width = 12,
  inline = false,
  background = '#fff',
}: {
  width?: CSSProperties['width'];
  inline?: boolean;
  background?: string;
}) => (
  <div
    style={{
      width: `${width}px`,
      background,
      display: inline ? 'inline-block' : 'block',
    }}
  />
);
