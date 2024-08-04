package com.drg.workflowmgmt.order;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

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
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        logger.debug("Received order: {}", order);
        try {
            Order createdOrder = orderService.createOrder(order);
            return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
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
