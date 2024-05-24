package com.drg.workflowmgmt.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(Order order) {
        // Validate required fields
        if (order.getOrderType() == null || order.getCurrentState() == null) {
            throw new IllegalArgumentException("Order type and current state are required");
        }
        return orderRepository.save(order);
    }

    public Order updateOrder(Long id, Order orderDetails) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setCurrentUser(orderDetails.getCurrentUser());
                    order.setCurrentState(orderDetails.getCurrentState());
                    order.setOwnerDetails(orderDetails.getOwnerDetails());
                    order.setPriority(orderDetails.getPriority());
                    order.setNote(orderDetails.getNote());
                    order.setAuditItems(orderDetails.getAuditItems());
                    return orderRepository.save(order);
                }).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }
}
