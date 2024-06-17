package com.drg.workflowmgmt.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        for (Order order: orders) {
            if(order.getCurrentUser() != null){
                order.getCurrentUser().setPassword("");
            }
        }
        return orders;
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @PostMapping("/{id}/moveToState")
    public Order moveToState(@PathVariable Long id, @RequestParam Long nextStateId) {
        return orderService.moveToState(id, nextStateId);
    }

    @PostMapping("/{id}/setNote")
    public Order setNote(@PathVariable Long id, @RequestParam String note) {
        return orderService.setNote(id, note);
    }

    @PostMapping("/{id}/setOwnerDetails")
    public Order setOwnerDetails(@PathVariable Long id, @RequestBody OwnerDetails ownerDetails) {
        return orderService.setOwnerDetails(id, ownerDetails);
    }

    @GetMapping("/myOrders")
    public List<Order> getOrdersForCurrentUser() {
        return orderService.getOrdersForCurrentUser();
    }

    @GetMapping("/availableOrdersForMe")
    public List<Order> getAvailableOrdersForMe() {
        return orderService.getAvailableOrdersForMe();
    }

    @PostMapping("/{id}/assignToMe")
    public void assignOrderToMe(@PathVariable Long id) {
        orderService.assignOrderToMe(id);
    }

    @GetMapping("/archived")
    public ResponseEntity<List<ArchivedOrder>> getAllArchivedOrders() {
        List<ArchivedOrder> archivedOrders = orderService.getAllArchivedOrders();
        return ResponseEntity.ok(archivedOrders);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
