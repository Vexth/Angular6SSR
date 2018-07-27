import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home1',
  templateUrl: './home1.component.html',
  styleUrls: ['./home1.component.css']
})
export class Home1Component implements OnInit {
  items: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.test('').subscribe((data: any) => {
      this.items = data.Data;
    })
  }

  test(data): Observable<any> {
    return this.http.post(encodeURI(`http://localhost:8100/test`), data);
  }

}
