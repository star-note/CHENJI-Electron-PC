import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import store from '@/store';
import { parseUrlParams } from '@/utils';

export const useUrlKeys = () => {
  // note为目标noteId或者新增笔记时的父节点，space为目标spaceId，recovery表示是否新建回收站笔记1
  const { note, space, recovery } = parseUrlParams(window.location.href);
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { changeOpenKeys } = store.dispatch.sys;

  useEffect(() => {
    const { pathname } = location;
    if (!pathname.startsWith('/notelist') || !pathname.startsWith('/space')) {
      setSelectedKeys([pathname]);
    }

    if (recovery === '1') {
      changeOpenKeys(['recovery']);
    } else if (
      (pathname.startsWith('/notelist') && space) ||
      pathname.startsWith('/space')
    ) {
      changeOpenKeys(['spaces']);
    } else if (pathname.startsWith('/notelist') && !space) {
      changeOpenKeys(['myNote']);
    }
  }, [location]);

  return [selectedKeys, setSelectedKeys];
};
