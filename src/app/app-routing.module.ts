import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PredictorComponent } from './predictor/predictor.component';
import { HelpComponent } from './help/help.component';


const routes: Routes = [
  {
    path: '',
    component: PredictorComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'predictor',
    component: PredictorComponent
  },
  {
    path: 'help',
    component: HelpComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
