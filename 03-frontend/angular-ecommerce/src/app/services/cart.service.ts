import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[]= [];

  totalPrice: Subject<number>= new BehaviorSubject<number>(0);
  totalQuantity: Subject<number>= new BehaviorSubject<number>(0);

  storage: Storage= sessionStorage; // reference to web browser's session storage, deleted when tab is closed
  //storage: Storage= localStorage; // reference to local storage, data survives even when browser is restarted

  
  constructor() {

    // read data from browser storage
    let data= JSON.parse(this.storage.getItem('cartItems'));

    if(data!= null){
      this.cartItems= data;

      this.computeCartTotals();
    }
   }

  addToCart(theCartItem: CartItem){

    // check is we already have item in cart
    let alreadyExistsInCart: boolean= false;
    let existingCartItem: CartItem= undefined;

    // find item in cart using id
    if(this.cartItems.length> 0){

      for(let tempCartItem of this.cartItems){
        if(theCartItem.id === tempCartItem.id){
          existingCartItem = tempCartItem;
          break;
        }
      }

      existingCartItem= this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
    }

    // check if we found item in cart
    alreadyExistsInCart= (existingCartItem!= undefined);
    
    if(alreadyExistsInCart){
      existingCartItem.quantity++;
    }
    else{
      this.cartItems.push(theCartItem);
    }

    // compute Cart total Price and Quantity
    this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let tempCartItem of this.cartItems){
      totalPriceValue += tempCartItem.unitPrice*tempCartItem.quantity;
      totalQuantityValue += tempCartItem.quantity;
    }

    // publish  new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.cartLogging();

    // persist cart data
    this.persistCartItems();
  }

  decrementQuantity(theCartItem: CartItem) {
    
    theCartItem.quantity--;

    if(theCartItem.quantity === 0){
      this.removeItem(theCartItem);
    }
    else{
      this.computeCartTotals();
    }
  }

  removeItem(theCartItem: CartItem) {
    
    // find index for theCartItem
    const theCartItemIndex= this.cartItems.findIndex( tempCartItem => tempCartItem == theCartItem);
    
    if(theCartItemIndex > -1){
      this.cartItems.splice(theCartItemIndex,1);
      this.computeCartTotals();
    }

    // remove theCartItem

  }

  cartLogging() {

    let subtotalPriceValue: number= 0.00;
    let tempQuantity: number = 0;

    console.log(`Cart Items Log:`);
    for(let tempCartItem of this.cartItems){
      subtotalPriceValue += tempCartItem.unitPrice*tempCartItem.quantity;
      tempQuantity += tempCartItem.quantity;

      console.log(`Adding ${tempCartItem.name} $ ${tempCartItem.unitPrice} Quantity:${tempCartItem.quantity}`);
      console.log(`Total Price= ${subtotalPriceValue} | Total Quantity= ${tempQuantity}`);
    }
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

}
