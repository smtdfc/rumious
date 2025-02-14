/**
 * Creates a throttle function that limits the number of times a function can be called in a given time interval.
 * 
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The minimum time (in milliseconds) between successive function calls.
 * @returns {Function} A new throttled function.
 */
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

/**
 * Creates a debounce function that delays the execution of the provided function until after a certain delay has passed
 * since the last call.
 * 
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The amount of time (in milliseconds) to wait before executing the function.
 * @returns {Function} A new debounced function.
 */
export function denounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Creates a throttle function that ensures the provided function is executed at most once every `limit` milliseconds,
 * but also ensures the function is executed once after the last call (trailing).
 * 
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The minimum time (in milliseconds) between successive function calls.
 * @returns {Function} A new throttled function.
 */
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

/**
 * Creates a debounce function that ensures the provided function is executed immediately on the first call
 * and after a certain delay for subsequent calls.
 * 
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The amount of time (in milliseconds) to wait before executing the function again.
 * @returns {Function} A new leading-trailing debounced function.
 */
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

/**
 * Creates a throttle function that ensures the provided function is executed once per animation frame.
 * 
 * @param {Function} func - The function to throttle.
 * @returns {Function} A new function that is throttled to execute once per animation frame.
 */
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