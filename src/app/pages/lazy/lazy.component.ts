import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransformService } from '../../services/transform.service';

@Component({
	selector: 'app-lazy',
	templateUrl: './lazy.component.html',
	styleUrls: ['./lazy.component.css']
})
export class LazyComponent implements OnInit {
	kfcList: any[] = [];

	constructor(public http: HttpClient, public transformService: TransformService) {
	}

	ngOnInit() {
		this.poiSearch('麦当劳', '南昌市').subscribe((data: any) => {
			this.kfcList = data.pois;
		});
		if (localStorage.getItem('token') === null) {
			this.token().subscribe((data: any) => {
				let s: string = data.Token
				localStorage.setItem('token', s)
			})
		}
	}

	poiSearch(text: string, city?: string): Observable<any> {
		return this.http.get(encodeURI(`http://restapi.amap.com/v3/place/text?keywords=${text}&city=${city}&offset=20&key=55f909211b9950837fba2c71d0488db9&extensions=all`));
	}

	token(): Observable<any> {
		return this.http.get(encodeURI(`http://localhost:8100/skipper`));
	}
}
