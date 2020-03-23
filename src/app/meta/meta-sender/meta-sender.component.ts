import {Component, OnInit} from '@angular/core';
import {Web3Service} from '../../util/web3.service';
import { MatSnackBar } from '@angular/material';

declare let require: any;
//const metacoin_artifacts = require('../../../../build/contracts/MetaCoin.json');

const lottery_artifacts = require('../../../../build/contracts/Lottery.json');

@Component({
  selector: 'app-meta-sender',
  templateUrl: './meta-sender.component.html',
  styleUrls: ['./meta-sender.component.css']
})
export class MetaSenderComponent implements OnInit {
  accounts: string[];
  MetaCoin: any;
  Lottery: any;

  model = {
    amount: 5,
    receiver: '',
    balance: 0,
    account: '',

    commulatedPrize:500,
    nextGameTime:1000,
    previousWinnersGames:0

  };

  status = '';

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    //this.web3Service.artifactsToContract(metacoin_artifacts)
    this.web3Service.artifactsToContract(lottery_artifacts)
      .then((LotteryAbstraction/*MetaCoinAbstraction*/) => {
        //this.MetaCoin = MetaCoinAbstraction;
        this.Lottery = LotteryAbstraction;
        /*this.MetaCoin.deployed().then(deployed => {
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
            this.refreshBalance();
          });
        });*/
        this.Lottery.deployed().then(deployed => {
          console.log(deployed);
          deployed.gamePosted({}, (err, ev) => {
            console.log('game posted event came in, refreshing balance');
            this.refreshBalance();
          });
        });

      });
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      this.refreshBalance();
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  async sendCoin() {

    alert("send coin");

    /*if (!this.MetaCoin) {
      this.setStatus('Metacoin is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const receiver = this.model.receiver;

    console.log('Sending coins' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedMetaCoin = await this.MetaCoin.deployed();
      const transaction = await deployedMetaCoin.sendCoin.sendTransaction(receiver, amount, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }*/
  }

  async postGame(){

    alert("thiago");

    if (!this.Lottery) {
      this.setStatus('Lottery is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    //const receiver = this.model.receiver;

    console.log('Posting game ' + amount );

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedLottery = await this.Lottery.deployed();
      //TODO parse string and give the array
      const transaction = await deployedLottery.postGame.sendTransaction([1,2,3,4,5,6,7,8], {from: this.model.account,value:1000000000000000000});

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

  async refreshBalance() {
    //console.log('Refreshing balance');
    console.log("Updating Prize");

    /*try {
      const deployedMetaCoin = await this.MetaCoin.deployed();
      console.log(deployedMetaCoin);
      console.log('Account', this.model.account);
      const metaCoinBalance = await deployedMetaCoin.getBalance.call(this.model.account);
      console.log('Found balance: ' + metaCoinBalance);
      this.model.balance = metaCoinBalance;
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting balance; see log.');
    }*/
    try {
      const deployedLottery = await this.Lottery.deployed();
      console.log(deployedLottery);
      //console.log('Account', this.model.account);
      const prizeBalance = await deployedLottery.getComulatedPrize.call();
      console.log('Found prize balance: ' + prizeBalance);
      this.model.commulatedPrize = prizeBalance;
      const previousWinnersGames = await deployedLottery.showWinnersGame.call();
      //TODO parse it
      console.log('Last winners games array: ' + previousWinnersGames);
      this.model.commulatedPrize = prizeBalance;
      this.model.previousWinnersGames = previousWinnersGames
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting prize balance; see log.');
    }
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.model.receiver = e.target.value;
  }

}
