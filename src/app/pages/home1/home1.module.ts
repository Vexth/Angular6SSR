import { NgModule } from '@angular/core';
import { Home1Component } from './home1.component';
import { Home1RoutingModule } from './home1.routes';
import { CommonModule } from '@angular/common';
import { TransformService } from '../../services/transform.service';

@NgModule({
	declarations: [Home1Component],
	imports: [
		CommonModule,
		Home1RoutingModule
	],
	providers: [
		TransformService
	]
})
export class Home1Module {

}