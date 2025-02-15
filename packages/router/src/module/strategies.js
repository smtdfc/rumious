class HashStrategy {
  constructor(router) {
    this.router = router;
  }
  
  redirect(path){
    window.location.hash=`${path}`;
  }
  
  start() {
    let currentPath = window.location.hash.slice(1);
    let url = new URL(currentPath, window.location.origin);
    window.addEventListener("hashchange", () => {
      currentPath = window.location.hash.slice(1);
      url = new URL(currentPath, window.location.origin);
      this.router.resolve(url);
    })
    
    this.router.resolve(url);
  }
}

export const RumiousRouterStrategies = {
  hash: HashStrategy,
  history: null
}