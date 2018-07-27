import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

const appRoutes: Routes = [
	{path: '', component: HomeComponent, pathMatch: 'full'},
	{path: 'home1', loadChildren: './pages/home1/home1.module#Home1Module'},
	{path: 'lazy', loadChildren: './pages/lazy/lazy.module#LazyModule'}
];

@NgModule({
	imports: [
		RouterModule.forRoot(appRoutes)
	],
	exports: [
		RouterModule
	]
})

export class AppRoutingModule {
}