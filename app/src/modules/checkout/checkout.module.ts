import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { CommonModule } from '../../common/common.module';

import { CardInput } from './card/card';
import { Checkout } from './braintree-checkout';
import { StripeCheckout } from './stripe-checkout';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { BlockchainCheckoutComponent } from './blockchain-checkout.component';

@NgModule({
  imports: [
    NgCommonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BlockchainModule,
  ],
  declarations: [
    CardInput,
    Checkout,
    StripeCheckout,
    BlockchainCheckoutComponent
  ],
  exports: [
    CardInput,
    Checkout,
    StripeCheckout,
    BlockchainCheckoutComponent
  ]
})
export class CheckoutModule {
}
