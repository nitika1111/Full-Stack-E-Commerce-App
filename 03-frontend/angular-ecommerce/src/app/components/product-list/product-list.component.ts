import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  currentCategoryName: string = 'Books';
  previousCategoryId: number = 1;
  searchMode: boolean = false;
  previousKeyword: string= null;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number= 10;
  theTotalElements: number= 0;


  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    });
  }

  listProducts(){

    this.searchMode= this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();
    }

    else{
      this.handleListProducts();    
    }
  }

  handleSearchProducts(){
    const theKeyword= this.route.snapshot.paramMap.get('keyword');

    if(this.previousKeyword!= theKeyword){
      this.thePageNumber= 1;
    }

    this.previousKeyword= theKeyword;
    console.log(`Keyword= ${theKeyword} and pageNumber= ${this.thePageNumber}`);

    this.productService.searchProductsPaginate( this.thePageNumber-1,
                                                this.thePageSize,
                                                theKeyword).subscribe(this.processResult());
  }

  handleListProducts(){
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      this.currentCategoryId= +this.route.snapshot.paramMap.get('id');
      this.currentCategoryName= this.route.snapshot.paramMap.get('categoryName');

    }
    else{
      this.currentCategoryId= 1;
      this.currentCategoryName= "Books";
    }

    // check if previous categoryId is same as current CategoryId. If different, reset thePageNumber to 1
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId= ${this.currentCategoryId}, thePageNumber= ${this.thePageNumber}`);

    // get the products for given category id
    this.productService.getProductListPaginate(this.thePageNumber-1,
                                       this.thePageSize,
                                       this.currentCategoryId )
                                       .subscribe(this.processResult());
    }
  processResult(){
    return data =>{
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  updatePageSize(pageSize: number){
    this.thePageSize= pageSize;
    this.thePageNumber= 1;
    this.listProducts();
  }

  addToCart(theProduct: Product){
    
    let theCartItem= new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }
}
