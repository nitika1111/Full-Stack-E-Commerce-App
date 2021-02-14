import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { AppFormService } from 'src/app/services/app-form.service';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { CustomValidators } from 'src/app/vaidators/custom-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  totalPrice: number= 0;
  totalQuantity: number= 0.0;

  creditCardMonths: number[]= [];
  creditCardYears: number[]= [];

  countries: Country[]= [];
  shippingAddressStates: State[]= [];
  billingAddressStates: State[]= [];

  constructor(private formBuilder: FormBuilder,
              private appFormService: AppFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {
    const startMonth: number= new Date().getMonth() + 1;

    this.checkoutFormGroup= this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        lastName: new FormControl('',[Validators.required, Validators.minLength(2), CustomValidators.notOnlyWhitespace]),
        email: new FormControl('',[Validators.required, Validators.pattern('^[a-z0-9.-_%+]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), CustomValidators.notOnlyWhitespace])
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('',[Validators.required]),
        street: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace]),
        state: new FormControl('',[Validators.required]),
        zipcode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{6}'), CustomValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('',[Validators.required]),
        street: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace]),
        state: new FormControl('',[Validators.required]),
        zipcode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{6}'), CustomValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required, CustomValidators.notOnlyWhitespace,Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    this.appFormService.getCreditCardMonths(startMonth).subscribe(
      data => { this.creditCardMonths= data;
      }
    )

    this.appFormService.getCreditCardYears().subscribe(
      data => { this.creditCardYears= data;
      }
    )

    // populate countries
    this.appFormService.getCountries().subscribe(
      data => 
      { 
        this.countries= data;
        console.log("Countries fetched: "+ JSON.stringify(this.countries));
      }
    );

    this.reviewCartTotals();
  }

  // Review Cart Totals: Populate values
  reviewCartTotals(){
    this.cartService.totalPrice.subscribe(
      data => {this.totalPrice= data}
    );
    this.cartService.totalQuantity.subscribe(
      data => {this.totalQuantity= data}
    );
  }

  // getters for customer
  get firstName(){ return this.checkoutFormGroup.get('customer.firstName');  }
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName');  }
  get email(){ return this.checkoutFormGroup.get('customer.email');  }

  // getters for shipping address
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country');  }
  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street');  }
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city');  }
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state');  }
  get shippingAddressZipcode(){ return this.checkoutFormGroup.get('shippingAddress.zipcode');  }

  // getters for billing address
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country');  }
  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street');  }
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city');  }
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state');  }
  get billingAddressZipcode(){ return this.checkoutFormGroup.get('billingAddress.zipcode');  }

  // getters for credit card
  get nameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard');  }
  get cardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber');  }
  get securityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode');  }

  onSubmit(){
    console.log("In onSubmit of checkout form");
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log(this.checkoutFormGroup.get('shippingAddress').value);
    console.log(this.checkoutFormGroup.get('billingAddress').value);
    console.log(this.checkoutFormGroup.get('creditCard').value);

    console.log(`Shipping Address Country is: ${this.checkoutFormGroup.get('shippingAddress').value.country.name}`);
    console.log(`Billing Address Country is: ${this.checkoutFormGroup.get('billingAddress').value.country.name}`);

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // setup order
    let order= new Order;
    order.totalPrice= this.totalPrice;
    order.totalQuantity= this.totalQuantity;

    // get cart items
    const cartItems= this.cartService.cartItems;

    // create orderItems from cartItems
    //(can use normal loop to copy from one array to another...but this is shorter way of doing that!)
    let orderItems: OrderItem[]= cartItems.map(tempCartItems=> new OrderItem(tempCartItems));

    // setup purchase
    let purchase= new Purchase();

    // populate purchase- shipping and billing address
    purchase.shippingAddress= this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State= JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: State= JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state= shippingState.name;
    purchase.shippingAddress.country= shippingCountry.name;

    purchase.billingAddress= this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State= JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: State= JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state= billingState.name;
    purchase.billingAddress.country= billingCountry.name;

    // populate purchase- customer
    purchase.customer= this.checkoutFormGroup.controls['customer'].value;

    // populate purchase- order and orderItems
    purchase.order= order;
    purchase.orderItems= orderItems;

    // call REST API via CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      // success path
      next: response=> {
        alert(`Your order has been placed. Your tracking number is ${response.orderTrackingNumber}`)
        
        // rest cart
        this.resetCart();
      },

      // failure path
      error: err=>{
        alert(`There is an error: ${err.message}`)
      }
    })

  }
  resetCart() {
    // reset cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);// send 0 to all subscribers to reset
    this.cartService.totalQuantity.next(0);// send 0 to all subscribers to reset

    // reset form data
    this.checkoutFormGroup.reset();

    // redirect to product page
    this.router.navigateByUrl("/products");

  }

  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress.setValue(
                                    this.checkoutFormGroup.controls.shippingAddress.value);
      
      this.billingAddressStates= this.shippingAddressStates;                                    
    }
    else{
      this.checkoutFormGroup.controls.billingAddress.reset();

      this.billingAddressStates= [];
    }
  }

  getMonthsAndYears(){

    const creditCardFormGroup= this.checkoutFormGroup.get("creditCard");

    const selectedYear= Number(creditCardFormGroup.value.expirationYear);
    const currentYear= new Date().getFullYear();

    let startMonth: number;

    if(selectedYear === currentYear){
      startMonth= new Date().getMonth()+1;
    }
    else{
      startMonth= 1;
    }

    this.appFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("creditCardMonths= "+ JSON.stringify(data));
        this.creditCardMonths= data;}
    )
  }

  getStates(formGroupName: string){
    const formGroup= this.checkoutFormGroup.get(formGroupName);

    const countryCode= formGroup.value.country.code;
    const countryName= formGroup.value.country.name;
    
    console.log(`Country Code= ${countryCode}`);
    console.log(`Country Name= ${countryName}`);

    this.appFormService.getStates(countryCode).subscribe(
      data =>{

        if(formGroupName === "shippingAddress"){
          this.shippingAddressStates= data;
        }
        else{
          this.billingAddressStates= data;
        }

        // select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    )
  }
}
