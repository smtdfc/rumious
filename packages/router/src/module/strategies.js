class HashStrategy {
  constructor(router) {
    this.router = router;
  }
  
  redirect(path) {
    window.location.hash = `${path}`;
  }
  
  resolve(url) {
    let result = this.router.resolve(url);
    if (result.type === "error") return console.log(result);
    this.router.params = result.params;
    this.router.render(result);
  }
  
  start() {
    let currentPath = window.location.hash.slice(1);
    if (currentPath.length == 0) currentPath = "/home/abc";
    let url = new URL(currentPath, window.location.origin);
    window.addEventListener('hashchange', () => {
      currentPath = window.location.hash.slice(1);
      if (currentPath.length == 0) currentPath = "/home/abc";
      url = new URL(currentPath, window.location.origin);
      this.resolve(url);
    })
    
    this.resolve(url);
  }
}

export const RumiousRouterStrategies = {
  hash: HashStrategy,
  history: null
}