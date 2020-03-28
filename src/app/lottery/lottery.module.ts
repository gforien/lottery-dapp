import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  MatGridListModule,
  MatCardModule,
  MatButtonModule,
  MatListModule 
} from '@angular/material'; 


import { LotteryGameComponent } from './lottery-game/lottery-game.component';



@NgModule({
  declarations: [LotteryGameComponent],

  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatListModule
  ],

  exports: [
    LotteryGameComponent
  ]

})
export class LotteryModule { }
