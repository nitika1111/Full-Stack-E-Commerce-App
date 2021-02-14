package com.nitika.ecommerce.service;

import com.nitika.ecommerce.dto.Purchase;
import com.nitika.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {
	
	PurchaseResponse placeOrder(Purchase purchase);

}
