import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnderconstructionComponent } from './underconstruction/underconstruction.component';



@NgModule({
  declarations: [
    UnderconstructionComponent
  ],
  imports: [
    CommonModule
  ],
  exports : [
    UnderconstructionComponent
  ]
})
export class SceneModule { }
