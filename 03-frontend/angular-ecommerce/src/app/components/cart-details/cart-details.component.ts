import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  cartItems: CartItem[]= [];
  totalPrice: number= 0;
  totalQuantity: number= 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  listCartDetails() {
    this.cartItems= this.cartService.cartItems;

    this.cartService.totalPrice.subscribe(
      data =>{ this.totalPrice= data}
    );

    this.cartService.totalQuantity.subscribe(
      data => {this.totalQuantity= data}
    );

    this.cartService.computeCartTotals();

    console.log(`In CartDetails--->`);
    console.log(`totalPrice=${this.totalPrice} and totalQuantity=${this.totalQuantity}`);
    console.log(`.cartService.totalPrice=${this.cartService.totalPrice} and .cartService.totalQuantity=${this.cartService.totalQuantity}`);
  }

  incrementQuantity(theCartItem: CartItem){
    this.cartService.addToCart(theCartItem);
  }

  decrementQuantity(theCartItem: CartItem){
    this.cartService.decrementQuantity(theCartItem);
  }

  remove(theCartItem: CartItem){
    this.cartService.removeItem(theCartItem);
  }
}
