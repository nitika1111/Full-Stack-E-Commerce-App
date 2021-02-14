package com.nitika.ecommerce.dto;

import java.util.Set;

import com.nitika.ecommerce.entity.Address;
import com.nitika.ecommerce.entity.Customer;
import com.nitika.ecommerce.entity.Order;
import com.nitika.ecommerce.entity.OrderItem;

import lombok.Data;

@Data
public class Purchase {

	private Customer customer;
	
	private Address shippingAddress;
	
	private Address billingAddress;
	
	private Order order;
	
	private Set<OrderItem> orderItems;
}
