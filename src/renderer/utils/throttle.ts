/**
 * @param fn {function} 被截流函数
 * @param delay {number} 延迟时间/ms
 * @param immediate {boolean} 是否先执行一次，默认先执行一次
 */
export function throttle(fn: any, delay = 500, immediate = true) {
  let last = 0;
  return (rest: any) => {
    const current = new Date().getTime();
    if (immediate) last = current;
    if (current - last > delay || current <= last) {
      fn(rest);
      last = current;
    }
  };
}

export function debance(fn: (...args: any) => void, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
