package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.Role;
import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.usermgmt.UserRepository;
import com.drg.workflowmgmt.workflow.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JobStateRepository jobStateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobService jobService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    public Order createOrder(Order order) {
        if (order.getOrderType() == null) {
            throw new IllegalArgumentException("Order type and start state are required");
        }

        Job orderTypeJob = jobService.getJob(order.getOrderType().getId());
        order.setOrderType(orderTypeJob);
        order.setCurrentState(order.getOrderType().getStartState());

        return orderRepository.save(order);
    }

    public Order moveToState(Long orderId, Long nextStateId) {
        Order order = getOrderById(orderId);
        Job job = order.getOrderType();
        JobState currentState = order.getCurrentState();

        List<Integer> fromStateIndexes = IntStream.range(0, job.getFromJobStateIds().size())
                .filter(index -> job.getFromJobStateIds().get(index).equals(currentState.getId()))
                .boxed()
                .collect(Collectors.toList());

        List<Long> nextStateIds = fromStateIndexes.stream()
                .map(index -> job.getToJobStateIds().get(index))
                .collect(Collectors.toList());

        if (!nextStateIds.contains(nextStateId)) {
            throw new IllegalArgumentException("Invalid transition state for the current order state.");
        }

        JobState nextState = jobStateRepository.findById(nextStateId)
                .orElseThrow(() -> new IllegalArgumentException("State not found"));

        User currentUser = getCurrentUser();

        if (!nextState.getRoles().contains(currentUser.getRoles().iterator().next().getName())) {
            throw new IllegalArgumentException("Current user's role is not allowed for the next state.");
        }

        Audit audit = new Audit();
        audit.setUser(currentUser);
        audit.setUserRole(currentUser.getRoles().iterator().next().getName());
        audit.setFromState(currentState);
        audit.setToState(nextState);
        audit.setNote(order.getNote());
        order.getAuditItems().add(audit);

        order.setCurrentState(nextState);
        order.setCurrentUser(null);

        return orderRepository.save(order);
    }

    public Order setNote(Long orderId, String note) {
        Order order = getOrderById(orderId);
        order.setNote(note);
        return orderRepository.save(order);
    }

    public Order setOwnerDetails(Long orderId, OwnerDetails ownerDetails) {
        Order order = getOrderById(orderId);
        order.setOwnerDetails(ownerDetails);
        return orderRepository.save(order);
    }

    private User getCurrentUser(){
        org.springframework.security.core.userdetails.User user = (org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser =  userRepository.findByUsername(user.getUsername()).get();
        return currentUser;
    }
    public List<Order> getOrdersForCurrentUser() {
        return orderRepository.findByCurrentUser(getCurrentUser());
    }

    public List<Order> getAvailableOrdersForMe() {
        User currentUser = getCurrentUser();
        List<String> currentUserRoles = currentUser.getRoles().stream().map(Role::getName).collect(Collectors.toList());

        // Fetch unassigned orders for each role of the current user
        List<Long> stateIds = jobStateRepository.findStateIdsByRoles(currentUserRoles);
        List<Order> availableOrders = orderRepository.findUnassignedOrdersByStateIds(stateIds);

        return availableOrders;
    }

    public void assignOrderToMe(Long orderId) {
        User currentUser = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getCurrentUser() != null) {
            throw new IllegalArgumentException("Order is already assigned to another user");
        }

        if (!order.getCurrentState().getRoles().contains(currentUser.getRoles().iterator().next().getName())) {
            throw new IllegalArgumentException("Current user's role is not allowed for this order's current state.");
        }

        order.setCurrentUser(currentUser);
        orderRepository.save(order);
    }
}
