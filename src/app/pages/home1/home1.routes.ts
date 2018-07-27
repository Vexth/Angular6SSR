import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home1Component } from './home1.component';

const home1Routes: Routes = [
	{path: '', component: Home1Component, pathMatch: 'full'}
];

@NgModule({
	imports: [
		RouterModule.forChild(home1Routes)
	],
	exports: [
		RouterModule
	]
})

export class Home1RoutingModule {
}