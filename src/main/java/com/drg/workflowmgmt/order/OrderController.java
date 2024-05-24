package com.drg.workflowmgmt.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order createdOrder = orderService.createOrder(order);
        return ResponseEntity.status(201).body(createdOrder);
    }

    @PutMapping("/{id}/moveToState/{nextStateId}")
    public ResponseEntity<Order> moveToState(@PathVariable Long id, @PathVariable Long nextStateId) {
        Order updatedOrder = orderService.moveToState(id, nextStateId);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}/setNote")
    public ResponseEntity<Order> setNote(@PathVariable Long id, @RequestBody String note) {
        Order updatedOrder = orderService.setNote(id, note);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}/setOwnerDetails")
    public ResponseEntity<Order> setOwnerDetails(@PathVariable Long id, @RequestBody OwnerDetails ownerDetails) {
        Order updatedOrder = orderService.setOwnerDetails(id, ownerDetails);
        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/myOrders")
    public ResponseEntity<List<Order>> getOrdersForCurrentUser() {
        List<Order> orders = orderService.getOrdersForCurrentUser();
        return ResponseEntity.ok(orders);
    }
}
