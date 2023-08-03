import { Component } from '@angular/core';

declare const JXG: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor() { }

  ngOnInit() {
    new Promise(resolve => setTimeout(resolve, 1)).then( () => {
      var board = JXG.JSXGraph.initBoard('jxgbox', {boundingbox: [-10, 10, 20, -10], axis: false});
      var p = board.create('point', [0, 0], {name: 'point'});
    });
  }
}
