export function tholle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let lastCall = 0;
  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  } as T;
}

export function denounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>): void {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  } as T;
}

export function trailingThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let lastCall = 0;
  let lastArgs: Parameters<T> | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function invoke(this: any) {
    lastCall = Date.now();
    func.apply(this, lastArgs!);
    lastArgs = null;
  }

  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    lastArgs = args;

    if (now - lastCall >= limit) {
      invoke.call(this);
    } else if (!timeout) {
      timeout = setTimeout(
        () => {
          timeout = null;
          invoke.call(this);
        },
        limit - (now - lastCall)
      );
    }
  } as T;
}

export function leadingTrailingDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  let isFirstCall = true;

  return function (this: any, ...args: Parameters<T>): void {
    if (isFirstCall) {
      func.apply(this, args);
      isFirstCall = false;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
      isFirstCall = true;
    }, delay);
  } as T;
}

export function rafThrottle<T extends (...args: any[]) => any>(func: T): T {
  let ticking = false;

  return function (this: any, ...args: Parameters<T>): void {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        func.apply(this, args);
        ticking = false;
      });
    }
  } as T;
}
