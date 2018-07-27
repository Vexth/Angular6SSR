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