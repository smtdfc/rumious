import { RumiousRouterModule, RumiousRouterStrategies, routerLazy } from 'rumious-router';

export default function(app) {
	const router = app.addModule(RumiousRouterModule, {
		strategy: RumiousRouterStrategies.hash,
		wrappers: {
		},
		routes: {
			/*
			'/': {
				components: [
					routerLazy(() => import('../pages/home.jsx'))
				]
			},
			*/
		}
	});
	
	router.on('error', (d) =>{
		//Handle error here 
	});
	
	app.router = router;
	return router;
}