import { Component, EventEmitter } from 'angular2/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { RouterLink } from "angular2/router";

import { Client } from '../../services/api';
import { WalletService } from '../../services/wallet';
import { Storage } from '../../services/storage';
import { MDL_DIRECTIVES } from '../../directives/material';
import { InfiniteScroll } from '../../directives/infinite-scroll';
import { CHECKOUT_COMPONENTS } from '../../components/checkout';


interface CreditCard {
  number?: number,
  type?: string,
  name?: string,
  sec?: number,
  month?: number | string,
  year?: number | string
}

@Component({
  selector: 'minds-payments-checkout',
  inputs: ['amount', 'merchant_guid', 'gateway', 'usePayPal: paypal', 'useCreditCard: creditcard', 'useBitcoin: bitcoin'],
  outputs: ['inputed', 'done'],
  template: `

    <div class="mdl-card m-payments-options" style="margin-bottom:8px;" *ngIf="usePayPal || useBitcoin">
        <div id="paypal-btn" *ngIf="usePayPal"></div>
        <div id="coinbase-btn" *ngIf="useBitcoin"></div>
    </div>

    <minds-checkout-card-input (confirm)="setCard($event)" [hidden]="inProgress || confirmation" *ngIf="useCreditCard"></minds-checkout-card-input>
    <div [hidden]="!inProgress" class="m-checkout-loading">
      <div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active" style="margin:auto; display:block;" [mdl]></div>
      <p>Capturing card details...</p>
    </div>

  `,
  directives: [ CORE_DIRECTIVES, MDL_DIRECTIVES, FORM_DIRECTIVES, CHECKOUT_COMPONENTS, InfiniteScroll ]
})

export class Checkout {

  inProgress : boolean = false;
  confirmation : boolean = false;
  error : string = "";
  card;

  inputed : EventEmitter<any> = new EventEmitter;
  done : EventEmitter<any> = new EventEmitter;

  amount : number = 0;
  merchant_guid;
  gateway : string = "merchants";

  braintree_client;
  bt_checkout;
  nonce : string = "";

  useCreditCard : boolean = true;
  usePayPal : boolean = false;
  useBitcoin : boolean = false;

	constructor(public client: Client){
     this.init();
	}

  init(){
    System.import('lib/braintree.js').then((braintree : any) => {
        this.client.get('api/v1/payments/braintree/token/' + this.gateway)
         .then((response : any) => { this.setupClient(braintree, response.token); });
      });
  }

  setupClient(braintree, token){
    this.braintree_client = new braintree.api.Client({ clientToken: token });

    if(this.usePayPal && !window.BraintreeLoaded){
      braintree.setup(token, "custom", {
        onReady: (integration) => {
          this.bt_checkout = integration;
          window.BraintreeLoaded = true;
        },
        onPaymentMethodReceived: (payload) => {
          this.inputed.next(payload.nonce);
        },
        paypal: {
          singleUse: false,
          container: 'paypal-btn'
        },
        //coinbase: {
        //  container: "coinbase-btn",
        //  headless: true
        //}
      });
    }
  }

  setCard(card){
    console.log(card);
    this.card = card;
    this.getCardNonce();
  }

  getCardNonce(){
    this.inProgress = true;
    this.braintree_client.tokenizeCard({
      number: this.card.number,
      expirationDate: this.card.month + '/' + this.card.year,
      //cardHolderName: this.card.name,
      //cardType: this.card.type,
      cvv: this.card.sec
    }, (err, nonce) => {
      if(err){
        this.error = err;
        this.inProgress = false;
        return false;
      }
      console.log(err, nonce);
      this.nonce = nonce;
      this.inputed.next(nonce);
      this.inProgress = false;
  //    this.purchase();
    });
  }

  purchase(){
    var self = this;

    this.inProgress = true;
    this.error = "";
    this.client.post('api/v1/payments/braintree/charge', {
        nonce: this.nonce,
        amount: this.amount,
        merchant_guid: this.merchant_guid
      })
      .then((response : any) => {
        if(response.status != 'success'){
          self.inProgress = false;
          self.error = "Please check your card details and try again.";
          return false;
        }
        self.confirmation = true;
        self.inProgress = false;
      })
      .catch((e) => {
        self.inProgress = false;
        self.error = "there was an error";
      });
  }

  ngOnDestroy(){
  }

}
