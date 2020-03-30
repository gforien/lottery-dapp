import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../util/web3.service';
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

  numbers = Array.from(Array(32)).map((e,i) => ++i)  //create 32 numbers (1,...,32) that the user can choose from
  selected_numbers: number[] = [];
  account_selected = null;

  prize: number = 0;
  lastGameTime: number = 0;
  nextGameTime: number = 0;
  countdown: string = "00 d 00 h 00 m 00 s";
  prevWinners: string[];

  ownership: boolean = false; 
  owner_balance: number = 0;



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
          this.getLastGameTime();
          this.getNextGameTime();
          this.getPrevWinners();
          this.checkOwnership();
          deployed.gamePosted({}, (err, ev) => {
            console.log('game posted event came in, refreshing balance');
            //this.refreshBalance();
            this.getComulatedPrize();
            this.getLastGameTime();
            this.getNextGameTime();
            this.getPrevWinners();
            this.checkOwnership();
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

  onSelect($event, number) {
    
    // only append number to selection if less than 8 numbers have been selected already && the number hasn't been selected before
    if(this.selected_numbers.length < 8 && !this.selected_numbers.includes(number)){
      
      // update the background color for selected numbers
      $event.target.style.background = 'gray';
      
      this.selected_numbers.push(number);
    }
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  makeBet() {

    if(this.selected_numbers.length == 8){
      console.log("makeBet()");
      console.log(this.selected_numbers);
      this.postGame()
    }
    else{
      console.log("Please choose 8 numbers before making a bet!");
    }
  }

  removeBet() {
    this.selected_numbers = [];

    var numbers: any = document.getElementsByClassName("mat-figure");
    for (let number of numbers) {
      number.style.background = 'lightblue';
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
    
    this.prize = Math.abs(prizeBalance/1000000000000000000);


  }

  async getLastGameTime(){
    // gets called on ngOnInit and sets the last game time
    // timestamp in milliseconds, e.g.:
    // this.lastGameTime = 1616949982000;
    try {

      const deployedLottery = await this.Lottery.deployed();

      //retrieves the time in seconds and gets converted to milliseconds (* 1000) to work for the view
      this.lastGameTime = await deployedLottery.getLastGameTime.call() * 1000;
      console.log('Last game time: ' + this.lastGameTime);
      

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting last time; see log.');
    }

  }

  async getNextGameTime(){
    // gets called on ngOnInit and sets the next game time
    // timestamp in milliseconds
    try {

      //const deployedLottery = await this.Lottery.deployed();
      //const nextGameTime = await deployedLottery.getNextGameTime.call();
      //console.log('Next game time: ' + nextGameTime);


      //TODO get 'real' next game time
      this.nextGameTime = 1585764812000;  // equal to 4/1/2020, 8:13:32 PM


      let delta: number;

      let delta_days: number;
      let delta_hours: number;
      let delta_min: number;
      let delta_sec: number;

      setInterval(() => {

        // delta of dates in milliseconds
        delta = this.nextGameTime - Date.now();


        //calculate delta of days 
        delta_days = Math.floor(delta / 1000 / 60 / 60 / 24);

        //calculate the hours of the remaining difference between delta and delta_days
        delta_hours = Math.floor(delta / 1000 / 60 / 60 ) - (delta_days*24);

        //calculate the min of the remaining difference between delta and delta_hours
        delta_min = Math.floor(delta / 1000 / 60 ) - (delta_days*24*60 + delta_hours*60);

        //calculate the sec of the remaining difference between delta and delta_min
        delta_sec = Math.floor(delta / 1000) - (delta_days*24*60*60 + delta_hours*60*60 + delta_min*60);


        // set final countdown string
        this.countdown =  delta_days + " d "; 
        this.countdown += delta_hours + " h "; 
        this.countdown += delta_min + " m ";
        this.countdown += delta_sec + " s ";

      }, 1000);
      

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting last time; see log.');
    }

  }

  async getPrevWinners(){
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

  async checkOwnership() {
    // TODO check if user is owner of an account
    // global ownership var is set to true in order to display ownership relevant information
    
    //this.ownership = true;

    // only if ownership was set to true, call the getBalance function
    if (this.ownership) { this.getBalance(); }
  }

  async getBalance() {
    console.log("getBalance()");   
  }

  async withdrawal() {
    console.log("withdrawal()");   
  }

}
