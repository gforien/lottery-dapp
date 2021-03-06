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
  current_bets: string[] = [];

  prize: number = 0;
  lastGameTime: number = 0;
  nextGameTime: number = 0;
  countdown: string = "00 d 00 h 00 m 00 s";
  prevWinners: string[];

  owner:string = "";
  ownership: boolean = false;
  owner_balance: number = 0;



  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar) {
    console.log('Constructor: ' + web3Service);
  }

  //TODO put a label over the owner's part showing: "Owner Dashboard"
  ngOnInit() {

    console.log("Initiating..");
    this.watchAccount();
    this.web3Service.artifactsToContract(lottery_artifacts)
      .then((LotteryAbstraction) => {

        this.Lottery = LotteryAbstraction;
        this.Lottery.deployed().then(deployed => {
          console.log("Lottery init",deployed);
          this.getOwner();
          this.getComulatedPrize();
          this.getLastGameTime();
          this.getNextGameTime();
          this.getPrevWinners();
          this.getCurrentBets();
          //this.checkOwnership();
          deployed.gamePosted({}, (err, ev) => {
            console.log('game posted event came in, refreshing balance');
            //this.refreshBalance();
            this.getComulatedPrize();
            this.getLastGameTime();
            this.getNextGameTime();
            this.getPrevWinners();
            this.getBalance();
            this.getCurrentBets();
            //this.checkOwnership();
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
      this.getOwner();
      this.getCurrentBets();


    });
  }

  removeNumFromArray(value){
    
    // TODO: remove number from array
    for(var i = 0; i < this.selected_numbers.length; i++){
      if (this.selected_numbers[i] === value){
        this.selected_numbers.splice(i, 1);
      }
    }
  }

  //TODO put it in order and implement the second click to remove only the number clicked
  onSelect($event, number) {

    // only append number to selection if less than 8 numbers have been selected already && the number hasn't been selected before
    if(this.selected_numbers.length < 8 && !this.selected_numbers.includes(number)){

      // update the background color for selected numbers
      $event.target.style.background = 'gray';

      this.selected_numbers.push(number);

      // sort numbers
      this.selected_numbers.sort(function(a, b){return a - b});
    }
    else{
      if(this.selected_numbers.includes(number)){

      this.removeNumFromArray(number);

      // recolor to the original
      $event.target.style.background = 'lightblue';
    }
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

      //this.getLastGameTime();
      //const deployedLottery = await this.Lottery.deployed();
      //const nextGameTime = await deployedLottery.getNextGameTime.call();
      //console.log('Next game time: ' + nextGameTime);

      const deployedLottery = await this.Lottery.deployed();

      //retrieves the time in seconds and gets converted to milliseconds (* 1000) to work for the view
      this.nextGameTime = await deployedLottery.getNextGameTimestamp.call()*1000;
      console.log('Next game time: ' + this.nextGameTime);

      //this.nextGameTime = getNextGameTimestamp//1585764812000;  // equal to 4/1/2020, 8:13:32 PM


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

        //console.log(Date.now());

        // set final countdown string
        if(this.nextGameTime<Date.now()){

        //if(delta_days<=0 && delta_hours ==0 && delta_min==0 && delta_sec==0){
          this.countdown = "Next bet will launch the game!"

        }else{

        this.countdown =  delta_days + " d ";
        this.countdown += delta_hours + " h ";
        this.countdown += delta_min + " m ";
        this.countdown += delta_sec + " s ";
      }

      }, 1000);


    } catch (e) {
      console.log(e);
      this.setStatus('Error getting next time; see log.');
    }

  }
  async getCurrentBets(){
    //this function gets called on ngOnInit and sets the previous winners
    this.current_bets = []

    try {


      const deployedLottery = await this.Lottery.deployed();
      //console.log(deployedLottery);
      //console.log('Account', this.model.account);

      const current_bets = await deployedLottery.showPlayersGames.call(this.account_selected);

      //const previousWinnersGames = "000012345"
      console.log('Current bets of player: ' + current_bets);



      for(var i=0;i<current_bets.length/8;i++){

          let array = []

          for(var j=0;j<8;j++){

            array.push(current_bets[i*8+j]);
          }
          this.current_bets.push(array.toString());
          //this.prevWinners.push(array.toString());


      }
      if ( this.current_bets.length==0){
        this.current_bets.push("You don't have any bets yet!");
      }


      //this.prevWinners.push(previousWinnersGames.toString());



    } catch (e) {
      console.log(e);
      this.setStatus('Error getting current bet; see log.');
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

  async getOwner(){

    try {


      const deployedLottery = await this.Lottery.deployed();

      const owner = await deployedLottery.getOwner.call();

      this.owner = owner;
      console.log("owner:",this.owner);

      //alert(this.owner);


    } catch (e) {
      console.log(e);
      this.setStatus('Error getting owner; see log.');
    }

    if(this.account_selected==this.owner){
      this.ownership = true;
    }else{
      this.ownership = false;
    }



    // only if ownership was set to true, call the getBalance function
    if (this.ownership) { this.getBalance(); }



  }

  /*async checkOwnership() {

    // global ownership var is set to true in order to display ownership relevant information
    //alert(this.account_selected+":"+this.owner);
    if(this.account_selected==this.owner){
      this.ownership = true;
    }



    // only if ownership was set to true, call the getBalance function
    if (this.ownership) { this.getBalance(); }
  }*/

  async getBalance() {

    try {


      const deployedLottery = await this.Lottery.deployed();

      const owner_balance = await deployedLottery.getOwnerReward.call();

      this.owner_balance = owner_balance/1000000000000000000;


      //alert(this.owner);


    } catch (e) {
      console.log(e);
      this.setStatus('Error getting owner balance; see log.');
    }


  }

  async withdrawal() {

    try {

      console.log("withdrawing");

      const deployedLottery = await this.Lottery.deployed();

      await deployedLottery.withdrawAsOwner({from:this.account_selected});

      this.owner_balance = 0;

      this.getBalance();


    } catch (e) {
      console.log(e);
      this.setStatus('Error getting owner withdraw; see log.');
    }


  }

}
