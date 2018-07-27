import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  items: any = []

  constructor() { }

  ngOnInit() {
    this.items = [
      {
        url: '/',
        name: '首页'
      },
      {
        url: '/lazy',
        name: '懒加载'
      },
      {
        url: '/home1',
        name: 'home1'
      }
    ]
  }

}
