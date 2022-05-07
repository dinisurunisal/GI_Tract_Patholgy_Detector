import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gi-tract-pathology-detection';

  events: string[] = [];
  opened: boolean;

  constructor() { }

  ngOnInit(): void {
  }
}
