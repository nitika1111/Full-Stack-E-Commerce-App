package com.nitika.ecommerce.service;

import java.util.Set;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nitika.ecommerce.dao.CustomerRepository;
import com.nitika.ecommerce.dto.Purchase;
import com.nitika.ecommerce.dto.PurchaseResponse;
import com.nitika.ecommerce.entity.Customer;
import com.nitika.ecommerce.entity.Order;
import com.nitika.ecommerce.entity.OrderItem;

@Service
public class CheckoutServiceImpl implements CheckoutService{
	
	private CustomerRepository customerRepository;
	
	@Autowired
	public CheckoutServiceImpl(CustomerRepository customerRepository) {
		this.customerRepository= customerRepository;
	}

	@Override
	@Transactional
	public PurchaseResponse placeOrder(Purchase purchase) {

		// retrieve the Order info from DTO
		Order order= purchase.getOrder();
		
		// generate tracking number
		String orderTrackingNumber= generateOrderTrackingNumber();
		order.setOrderTrackingNumber(orderTrackingNumber);
		
		// populate order with orderItems
		Set<OrderItem> orderItems= purchase.getOrderItems();
		orderItems.forEach(item-> order.add(item));
		
		// populate order with billing and shipping items
		order.setBillingAddress(purchase.getBillingAddress());
		order.setShippingAddress(purchase.getShippingAddress());
		
		// populate customer with order
		Customer customer= purchase.getCustomer();
		
		// check if customer already exists in DB
		String theEmail= customer.getEmail();
		Customer customerFromDb= customerRepository.findByEmail(theEmail);
		if(customerFromDb != null) {
			customer= customerFromDb;
		}
		
		customer.add(order);
		
		// save to the DB
		customerRepository.save(customer);
		
		// return a response
		return new PurchaseResponse(orderTrackingNumber);
	}

	private String generateOrderTrackingNumber() {

		// generate a random UUID number(version 4)
		
		return UUID.randomUUID().toString();
	}

}
