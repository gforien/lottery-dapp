import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lottery-game',
  templateUrl: './lottery-game.component.html',
  styleUrls: ['./lottery-game.component.css']
})
export class LotteryGameComponent implements OnInit {


  numbers = Array.from(Array(32).keys());  //create 32 numbers (0,...,31) that the user can choose from
  selected_numbers = [];

  price = 0;
  nextGameTime = 0;
  prevWinners = [];

  
  constructor() { }

  ngOnInit() {
    this.getComulatedPrice();
    this.getNextGameTime();
    this.getPrevWinners();
  }

  onSelect(number): void {
    console.log(number);

    if(this.selected_numbers.length < 8){
      this.selected_numbers.push(number);
    }
  }

  makeBet(): void {
    if(this.selected_numbers.length == 8){
      console.log("makeBet()");
      console.log(this.selected_numbers);
    }
    else{
      console.log("Please choose 8 numbers before making a bet!");
    }
  }

  removeBet(): void {
    this.selected_numbers = [];
  }

  getComulatedPrice(): void {
    //this function gets called on ngOnInit and sets the comulated price
    this.price = 1;
  }

  getNextGameTime(): void {
    //this function gets called on ngOnInit and sets the next game time
    //timestamp in milliseconds
    this.nextGameTime = 1616949982000;
  }

  getPrevWinners(): void {
    //this function gets called on ngOnInit and sets the previous winners
    this.prevWinners.push("0x858dCE688010Ad334c4AD9258ACC133664De32De");
    this.prevWinners.push("0x858dCE688010Ad334c4AD9258ACC133664De32De");
    this.prevWinners.push("0x858dCE688010Ad334c4AD9258ACC133664De32De");
  }

  
}
