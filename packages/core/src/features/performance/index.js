export function tholle(func, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

export function denounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

export function trailingThrottle(func, limit) {
  let lastCall = 0;
  let lastArgs = null;
  let timeout = null;

  function invoke() {
    lastCall = Date.now();
    func.apply(this, lastArgs);
    lastArgs = null;
  }

  return function(...args) {
    const now = Date.now();
    lastArgs = args;

    if (now - lastCall >= limit) {
      invoke();
    } else if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        invoke();
      }, limit - (now - lastCall));
    }
  };
}

export function leadingTrailingDebounce(func, delay) {
  let timer;
  let isFirstCall = true;

  return function(...args) {
    if (isFirstCall) {
      func.apply(this, args);
      isFirstCall = false;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
      isFirstCall = true;
    }, delay);
  };
}

export function rafThrottle(func) {
  let ticking = false;

  return function(...args) {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        func.apply(this, args);
        ticking = false;
      });
    }
  };
}