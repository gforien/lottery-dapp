import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UtilModule} from '../util/util.module';
import {
  MatGridListModule,
  MatCardModule,
  MatButtonModule,
  MatListModule,
  MatToolbarModule
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
