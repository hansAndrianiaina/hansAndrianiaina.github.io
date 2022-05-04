import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnderconstructionComponent } from './modules/scene/underconstruction/underconstruction.component';

const routes: Routes = [
  {
    path :'',
    redirectTo : 'underconstruction',
    pathMatch : 'full'
  },
  {
    path : 'underconstruction',
    component : UnderconstructionComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
