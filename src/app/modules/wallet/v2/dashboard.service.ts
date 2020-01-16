import { Injectable } from '@angular/core';
import { Client } from '../../../common/api/client.service';
import { Session } from '../../../services/session';
import { Web3WalletService } from '../../blockchain/web3-wallet.service';
import { TokenContractService } from '../../blockchain/contracts/token-contract.service';
import toFriendlyCryptoVal from '../../../helpers/friendly-crypto';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
  delay,
  debounceTime,
} from 'rxjs/operators';

import fakeData from './fake-data';

@Injectable()
export class WalletDashboardService {
  walletLoaded = false;
  totalTokens = 0;
  wallet: any = {
    tokens: {
      label: 'Tokens',
      unit: 'tokens',
      balance: '0',
      address: null,
    },
    offchain: {
      label: 'Off-chain',
      unit: 'tokens',
      balance: '0',
      address: 'offchain',
    },
    onchain: {
      label: 'On-chain',
      unit: 'tokens',
      balance: '0',
      address: null,
    },
    receiver: {
      label: 'Receiver',
      unit: 'tokens',
      balance: '0',
      address: null,
    },
    usd: {
      label: 'USD',
      unit: 'usd',
      balance: '0',
      address: null,
    },
    eth: {
      label: 'Ether',
      unit: 'eth',
      balance: '0',
      address: null,
    },
    btc: {
      label: 'Bitcoin',
      unit: 'btc',
      balance: '0',
      address: null,
    },
    // loading: false,
  };

  // private store = new BehaviorSubject<WalletState>(_state);
  // private state$ = this.store.asObservable();

  // tokens$ = this.state$.pipe(
  //   map(state => state.tokens),
  //   distinctUntilChanged()
  // );
  // offchain$ = this.state$.pipe(
  //   map(state => state.offchain),
  //   distinctUntilChanged()
  // );
  // onchain$ = this.state$.pipe(
  //   map(state => state.onchain),
  //   distinctUntilChanged()
  // );
  // receiver$ = this.state$.pipe(
  //   map(state => state.receiver),
  //   distinctUntilChanged()
  // );
  // usd$ = this.state$.pipe(
  //   map(state => state.usd),
  //   distinctUntilChanged()
  // );
  // eth$ = this.state$.pipe(
  //   map(state => state.eth),
  //   distinctUntilChanged()
  // );
  // btc$ = this.state$.pipe(
  //   map(state => state.btc),
  //   distinctUntilChanged()
  // );

  // loading$ = this.state$.pipe(map(state => state.loading));

  /**
   * Viewmodel that resolves once all the data is ready (or updated)...
   */
  // wallet$: Observable<WalletState> = combineLatest([
  //   this.tokens$,
  //   this.onchain$,
  //   this.receiver$,
  //   this.offchain$,
  //   this.usd$,
  //   this.eth$,
  //   this.btc$,
  //   this.loading$,
  // ]).pipe(
  //   map(([tokens, onchain, receiver, offchain, usd, eth, btc, loading]) => {
  //     return { tokens, onchain, receiver, offchain, usd, eth, btc, loading };
  //   })
  // );

  constructor(
    private client: Client,
    protected web3Wallet: Web3WalletService,
    protected tokenContract: TokenContractService,
    protected session: Session
  ) {
    // /**
    //  * Subscribe to multiple streams to trigger state updates
    //  */
    // combineLatest([this.tokens$, this.pagination$])
    //   .pipe(
    //     switchMap(([criteria, pagination]) => {
    //       return this.findAllUsers(criteria, pagination);
    //     })
    //   )
    //   .subscribe(users => {
    //     this.updateState({ ..._state, users, loading: false });
    //   });
    // // TODOOJM make sure I unsubscribe to this
    // // WARNING if state is updating both of 'tokens' and pogination'
  }

  // TODOOJM: make wallet an observable and have the dashboard component subscribe to it
  getWallet() {
    this.getTokenAccounts();
    this.getEthAccount();
    this.getStripeAccount();

    // TODOOJM toggle me before pushing
    this.wallet = fakeData.wallet;

    // TODOOJM remove
    console.log('********');
    console.log(this.wallet);
    console.log('********');

    this.walletLoaded = true;
    return this.wallet;
  }

  async getTokenAccounts() {
    await this.loadOffchainAndReceiver();
    await this.loadOnchain();
    const tokenTypes = ['tokens', 'onchain', 'offchain', 'receiver'];

    const tokenWallet = {};
    tokenTypes.forEach(type => {
      tokenWallet[type] = this.wallet[type];
    });
    return tokenWallet;
  }

  async loadOffchainAndReceiver() {
    try {
      const response: any = await this.client.get(
        `api/v2/blockchain/wallet/balance`
      );

      if (response && response.addresses) {
        this.totalTokens = toFriendlyCryptoVal(response.balance);
        response.addresses.forEach(address => {
          if (address.label === 'Offchain') {
            this.wallet.offchain.balance = toFriendlyCryptoVal(address.balance);
          } else if (address.label === 'Receiver') {
            this.wallet.onchain.balance = toFriendlyCryptoVal(address.balance);
            this.wallet.receiver.balance = toFriendlyCryptoVal(address.balance);
            this.wallet.receiver.address = address.address;
          }
        });
        return this.wallet;
      } else {
        console.error('No data');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async loadOnchain() {
    try {
      const address = await this.web3Wallet.getCurrentWallet();
      if (!address) {
        return;
      }

      this.wallet.onchain.address = address;
      if (this.wallet.receiver.address === address) {
        return; // don't re-add onchain balance to totalTokens
      }

      const onchainBalance = await this.tokenContract.balanceOf(address);
      this.wallet.onchain.balance = toFriendlyCryptoVal(
        onchainBalance[0].toString()
      );
      this.wallet.tokens.balance += toFriendlyCryptoVal(
        this.wallet.onchain.balance
      );
    } catch (e) {
      console.log(e);
    }
  }

  async getEthAccount() {
    const address = await this.web3Wallet.getCurrentWallet();
    if (!address) {
      return;
    }
    this.wallet.eth.address = address;
    const ethBalance = await this.web3Wallet.getBalance(address);
    if (ethBalance) {
      this.wallet.eth.balance = toFriendlyCryptoVal(ethBalance);
    }
    return this.wallet.eth;
  }

  async getStripeAccount() {
    const merchant = this.session.getLoggedInUser().merchant;

    //TODOOJM toggle
    return fakeData.stripe_account.account;
    // if (merchant && merchant.service === 'stripe') {
    // try {
    //   const stripeAccount = <any>(
    //     await this.client.get('api/v2/payments/stripe/connect')
    //   ).account;
    //   if (stripeAccount && stripeAccount.totalBalance) {
    //     this.wallet.usd.balance =
    //       (stripeAccount.totalBalance.amount +
    //         stripeAccount.pendingBalance.amount) *
    //       100;
    //   }

    // return stripeAccount;
    // } catch (e) {
    //   console.error(e);
    //   return;
    // }
    // } else {
    //   return;
    // }
  }

  async updateStripeAccount() {
    try {
      const response = <any>(
        await this.client.post('api/v2/payments/stripe/connect')
      );
      return response;
    } catch (e) {
      console.error(e);
      return e;
    }
  }
  // async uploadDocument(fileInput: HTMLInputElement, documentType: string) {
  //   const file = fileInput ? fileInput.files[0] : null;
  //   this.editing = true;
  //   this.detectChanges();
  //   await this.upload.post(
  //     'api/v2/payments/stripe/connect/document/' + documentType,
  //     [file]
  //   );
  //   this.editing = false;
  //   this.account = null;
  //   this.getSettings();
  // }

  // async updateField(fieldName: string, value: string) {
  //   this.editing = true;
  //   this.detectChanges();
  //   let body = {};
  //   body[fieldName] = value;
  //   await this.client.post('api/v2/payments/stripe/connect/update', body);
  //   this.editing = false;
  //   this.account = null;
  //   this.getSettings();
  // }

  // async acceptTos() {
  //   this.editing = true;
  //   this.detectChanges();
  //   await this.client.put('api/v2/payments/stripe/connect/terms');
  //   this.editing = false;
  //   this.account = null;
  //   this.getSettings();
  // }

  async cancelStripeAccount() {
    try {
      const response = <any>(
        await this.client.delete('api/v2/payments/stripe/connect')
      );
      return response;
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  async getStripeTransactions() {
    try {
      // const { response } = <any>(
      //   await this.client.get('api/v2/payments/stripe/transactions')
      // );
      // TODOOJM toggle fake data
      // return response.transactions;
      return fakeData.tx_usd.transactions;
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async getStripePayouts() {
    try {
      // const { response } = <any>(
      //   await this.client.get('api/v1/monetization/service/analytics/list?offset=&limit=12&type=payouts'
      // );
      // TODOOJM toggle fake data
      // return response.transactions;
      return fakeData.stripe_payouts;
    } catch (e) {
      console.error(e);
      return;
    }
  }

  // TODOOJM bucket endpoint needed
  getTokenChart(activeTimespan) {
    return fakeData.visualisation;
  }

  getTokenTransactionTable() {
    // TODOOJM get this from token transactions component
    return fakeData.token_transactions;
  }

  async hasMetamask(): Promise<boolean> {
    const isLocal: any = await this.web3Wallet.isLocal();
    return Boolean(isLocal);
  }

  async canTransfer() {
    try {
      const response: any = await this.client.post(
        'api/v2/blockchain/transactions/can-withdraw'
      );
      // const { response } = <any>(
      //   await this.client.post('api/v2/blockchain/transactions/can-withdraw')
      // );
      if (!response) {
        return false;
      }
      return response.canWithdraw;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async web3WalletUnlocked() {
    await this.web3Wallet.ready();
    if (await this.web3Wallet.unlock()) {
      return true;
    } else {
      return false;
    }
  }
}
