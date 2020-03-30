import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import { MatSnackBar } from '@angular/material';

declare let require: any;
const lottery_artifacts = require('../../../../build/contracts/Lottery.json');

@Component({
  selector: 'app-lottery-game',
  templateUrl: './lottery-game.component.html',
  styleUrls: ['./lottery-game.component.css']
})
export class LotteryGameComponent implements OnInit {

  accounts: string[];
  Lottery: any;

  //TODO 1 to 32
  numbers = Array.from(Array(32).keys());  //create 32 numbers (0,...,31) that the user can choose from
  selected_numbers = [];
  account_selected = null;

  prize = 0;
  nextGameTime = 0;
  prevWinners = [];


  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit() {

    console.log("Initiating..");
    this.watchAccount();
    this.web3Service.artifactsToContract(lottery_artifacts)
      .then((LotteryAbstraction) => {

        this.Lottery = LotteryAbstraction;
        this.Lottery.deployed().then(deployed => {
          console.log("Lottery init",deployed);
          this.getComulatedPrize();
          this.getNextGameTime();
          this.getPrevWinners();
          deployed.gamePosted({}, (err, ev) => {
            console.log('game posted event came in, refreshing balance');
            //this.refreshBalance();
            this.getComulatedPrize();
            this.getNextGameTime();
            this.getPrevWinners();
          });
        });

      });

  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      //this.model.account = accounts[0];
      //this.refreshBalance();
      this.account_selected = accounts[0];
      console.log("Account:",this.account_selected);

    });
  }

  onSelect(number): void {
    console.log(number);

    if(this.selected_numbers.length < 8){
      this.selected_numbers.push(number);
    }
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  makeBet(): void {

    //TODO check if the numbers are differents
    if(this.selected_numbers.length == 8){
      console.log("makeBet()");
      console.log(this.selected_numbers);
      this.postGame()
    }
    else{
      console.log("Please choose 8 numbers before making a bet!");
    }
  }

  async postGame(){

    //alert("thiago");

    if (!this.Lottery) {
      this.setStatus('Lottery is not loaded, unable to send transaction');
      return;
    }

    //const amount = this.model.amount;
    //const receiver = this.model.receiver;

    console.log('Posting game ' + this.selected_numbers );

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedLottery = await this.Lottery.deployed();
      //TODO parse string and give the array
      const transaction = await deployedLottery.postGame.sendTransaction(this.selected_numbers, {from: this.account_selected,value:1000000000000000000});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log("error sending post game: "+e);
      this.setStatus('Error sending coin; see log.');
    }


  }

  removeBet(): void {
    this.selected_numbers = [];
  }

  getComulatedPrice(): void {
    //this function gets called on ngOnInit and sets the comulated price
    console.log("print price");

    this.prize = 1;
  }


  async getComulatedPrize(){
    console.log("geting commulated prize");
    let prizeBalance=31;

    try {


      const deployedLottery = await this.Lottery.deployed();
      //console.log(deployedLottery);
      //console.log('Account', this.model.account);
      prizeBalance = await deployedLottery.getComulatedPrize.call();
      console.log('Found prize balance: ' + prizeBalance.toString());


    } catch (e) {
      console.log(e);
      this.setStatus('Error getting prize balance; see log.');
    }
    this.prize = prizeBalance.toString()/1000000000000000000;


  }

  async getNextGameTime(){
    //this function gets called on ngOnInit and sets the next game time
    //timestamp in milliseconds
    //this.nextGameTime = 1616949982000;
    try {


      const deployedLottery = await this.Lottery.deployed();


      const nextGameTime = await deployedLottery.getLastGameTime.call();
      console.log('Next game time: ' + nextGameTime);

      //TODO make a count down
      this.nextGameTime = Date(nextGameTime);

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting next time; see log.');
    }



  }




async  getPrevWinners(){
    //this function gets called on ngOnInit and sets the previous winners
    this.prevWinners = []

    try {


      const deployedLottery = await this.Lottery.deployed();
      //console.log(deployedLottery);
      //console.log('Account', this.model.account);

      const previousWinnersGames = await deployedLottery.showWinnersGame.call();
      //TODO parse it
      //const previousWinnersGames = "000012345"
      console.log('Last winners games array: ' + previousWinnersGames);



      for(var i=0;i<previousWinnersGames.length/8;i++){

          let array = []

          for(var j=0;j<8;j++){

            array.push(previousWinnersGames[i*8+j]);
          }
          this.prevWinners.push(array.toString());


      }


      //this.prevWinners.push(previousWinnersGames.toString());



    } catch (e) {
      console.log(e);
      this.setStatus('Error getting prev winners; see log.');
    }


  }


}
