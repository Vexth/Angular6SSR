# Angular6SSR

Angular6 服务端渲染应用实例

### 安装

`ng new Angular6SSR`

`yarn add @nguniversal/common @nguniversal/express-engine @nguniversal/module-map-ngfactory-loader express ts-loader webpack-node-externals`

其他的遇到少了什么就按照提示安装就可以了，这里略过...

### webpack.config.js, server.ts, prerender.ts, static.paths.ts

在项目根目录新建 `webpack.config.js, server.ts, prerender.ts, static.paths.ts` 文件
``` javascript
// webpack.config.js

const webpack = require('webpack');
const path = require('path')

module.exports = {
  entry: {
    // This is our Express server for Dynamic universal
    server: './server.ts',
    // This is an example of Static prerendering (generative)
    prerender: './prerender.ts'
  },
  target: 'node',
  mode: 'none',
  resolve: {extensions: ['.ts', '.js']},
  // Make sure we include all node_modules etc
  externals: [/(node_modules|main\..*\.js)/,],
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /[\/\\]@angular[\/\\].+\.js$/,
        parser: { system: true }
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
};
```

```javascript
// server.ts

import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

/* - Example Express Rest API endpoints -
  app.get('/api/**', (req, res) => { });
*/

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
  maxAge: '1y'
}));

// ALl regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', {req});
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
```

```javascript
// prerender.ts

// Load zone.js for the server.
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { enableProdMode } from '@angular/core';
// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { renderModuleFactory } from '@angular/platform-server';
import { ROUTES } from './static.paths';

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');

const BROWSER_FOLDER = join(process.cwd(), 'browser');

// Load the index.html file containing referances to your application bundle.
const index = readFileSync(join('browser', 'index.html'), 'utf8');

let previousRender = Promise.resolve();

// Iterate each route path
ROUTES.forEach(route => {
  const fullPath = join(BROWSER_FOLDER, route);

  // Make sure the directory structure is there
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath);
  }

  // Writes rendered HTML to index.html, replacing the file if it already exists.
  previousRender = previousRender.then(_ => renderModuleFactory(AppServerModuleNgFactory, {
    document: index,
    url: route,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  })).then(html => writeFileSync(join(fullPath, 'index.html'), html));
});
```

```javascript
// static.paths.ts

export const ROUTES = [
	'/',
	'/lazy'
];
```

### main.server.ts, main.ts, tsconfig.server.json

在项目 `src` 文件中新建 `main.server.ts, tsconfig.server.json` 文件，修改 `main.ts` 文件
```javascript
// main.server.ts

export { AppServerModule } from './app/app.server.module';
```

```javascript
// tsconfig.server.json

{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "../out-tsc/app",
    "baseUrl": "./",
    "module": "commonjs",
    "types": []
  },
  "exclude": [
    "test.ts",
    "**/*.spec.ts"
  ],
  "angularCompilerOptions": {
    "entryModule": "app/app.server.module#AppServerModule"
  }
}
```

```javascript
// main.ts 

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.log(err));

// 在 DOMContentLoaded 时运行我们的代码，以使 TransferState 正常工作
document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
});
```

### app.module.ts, app.server.module.ts

在项目 `src/app` 文件中添加 `app.server.module.ts` 文件，修改 `app.module.ts` 文件

```javascript
// app.server.module.ts

import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

// 可以注册那些在 Universal 环境下运行应用时特有的服务提供商
@NgModule({
  imports: [
    AppModule,                  // 客户端应用的 AppModule
    ServerModule,               // 服务端的 Angular 模块
    ModuleMapLoaderModule,      // 用于实现服务端的路由的惰性加载
    ServerTransferStateModule,  // 在服务端导入，用于实现将状态从服务器传输到客户端
  ],
  bootstrap: [AppComponent]
})

export class AppServerModule {  }
```

```javascript
// app.module.ts

import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { APP_ID, Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { isPlatformBrowser } from '@angular/common';

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';

import { NavComponent } from './pages/nav/nav.component';

import { AppRoutingModule } from './app.routes';

import { ServerInterceptor } from './services/server.interceptor';

@NgModule({
	imports: [
		AppRoutingModule,
		BrowserModule.withServerTransition({appId: 'Angluar6SSR'}),
		TransferHttpCacheModule, 	// 用于实现服务器到客户端的请求传输缓存，防止客户端重复请求服务端已完成的请求
		BrowserTransferStateModule, // 在客户端导入，用于实现将状态从服务器传输到客户端
		HttpClientModule
	],
	declarations: [
		AppComponent,
		HomeComponent,
		NavComponent
	],
	providers: [{
		provide: HTTP_INTERCEPTORS,
    useClass: ServerInterceptor,
    multi: true
	}],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(@Inject(PLATFORM_ID) private platformId: Object, @Inject(APP_ID) private appId: string) {
		const platform = isPlatformBrowser(platformId) ? 'in the browser' : 'on the server';
		console.log(`Running ${platform} with appId=${appId}`);
	}
}
```

### 新建文件修改文件已完成，最后把文件配置搞定就完事了

- **配置angular.json**: 找到文件中的 `outputPath` 字段，修改其参数为 `dist/browser`（`dist、browser`在`server.ts`文件中有配置过的，必须一致），在 `lint` 下面增加代码 
```javascript
"server": {
  "builder": "@angular-devkit/build-angular:server",
  "options": {
    "outputPath": "dist/server",
    "main": "src/main.server.ts",
    "tsConfig": "src/tsconfig.server.json"
  }
}
```

- **配置package.json**: 
```javascript
"scripts": {
  "ng": "ng",
  "start": "ng serve -o",
  "ssr": "npm run build:ssr && npm run serve:ssr",
  "prerender": "npm run build:prerender && npm run serve:prerender",
  "build": "ng build",
  "lint": "ng lint --fix",
  "build:client-and-server-bundles": "ng build --prod --build--optimizer && ng run Angular6SSR:server",
  "build:prerender": "npm run build:client-and-server-bundles && npm run webpack:server && npm run generate:prerender",
  "build:ssr": "npm run build:client-and-server-bundles && npm run webpack:server",
  "generate:prerender": "cd dist && node prerender",
  "webpack:server": "webpack --config webpack.config.js --progress --colors",
  "serve:prerender": "cd dist/browser && http-server",
  "serve:ssr": "node dist/server",
  "test": "ng test",
  "e2e": "ng e2e"
}
```

### 运行

`yarn ssr`
访问 `http://localhost:4000` 打完收工
