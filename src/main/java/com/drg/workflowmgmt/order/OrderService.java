package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.Role;
import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.usermgmt.UserRepository;
import com.drg.workflowmgmt.usermgmt.UserService;
import com.drg.workflowmgmt.workflow.*;
import jakarta.transaction.Transactional;
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
    private UserService userService;

    @Autowired
    private JobService jobService;

    @Autowired
    private ArchivedAuditRepository archivedAuditRepository;

    @Autowired
    private ArchivedOrderRepository archivedOrderRepository;

    @Autowired
    private AuditRepository auditRepository;

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

        User currentUser = userService.getCurrentUser();

        Audit audit = new Audit();
        audit.setUser(currentUser);
        audit.setUserRole(currentUser.getRoles().iterator().next().getName());
        audit.setFromState(currentState);
        audit.setToState(nextState);
        audit.setNote(order.getNote());
        order.getAuditItems().add(audit);

        order.setCurrentState(nextState);
        order.setCurrentUser(null);

        if (nextState.equals(order.getOrderType().getEndState())) {
            archiveOrderAndAudits(order);
            return order;
        }else {
            return orderRepository.save(order);
        }

    }
    @Transactional
    private void archiveOrderAndAudits(Order order) {
        try {
            // Archive order
            ArchivedOrder archivedOrder = new ArchivedOrder();
            archivedOrder.setId(order.getId());
            archivedOrder.setOrderType(order.getOrderType().getName());
            archivedOrder.setCurrentState(order.getCurrentState().getName());
            archivedOrder.setNote(order.getNote());
            if(null != order.getOwnerDetails() ){
                OwnerDetails ownerDetails = new OwnerDetails();
                ownerDetails.setOwnerName(order.getOwnerDetails().getOwnerName());
                ownerDetails.setOwnerAddress(order.getOwnerDetails().getOwnerAddress());
                ownerDetails.setOwnerEmail(order.getOwnerDetails().getOwnerEmail());
                ownerDetails.setOwnerMobile(order.getOwnerDetails().getOwnerMobile());
                archivedOrder.setOwnerDetails(ownerDetails);
            }

            // Archive related audits
            List<Audit> audits = order.getAuditItems();
            List<ArchivedAudit> archivedAudits = new ArrayList<>();
            for (Audit audit : audits) {
                ArchivedAudit archivedAudit = new ArchivedAudit();
                archivedAudit.setId(audit.getId());
                archivedAudit.setCreatedAt(audit.getTimestamp());
                archivedAuditRepository.save(archivedAudit);
                archivedAudits.add(archivedAudit);
            }
            archivedOrder.setAuditItems(archivedAudits);

            // Save the archived order
            archivedOrderRepository.save(archivedOrder);

            // Delete order and related audits
            auditRepository.deleteAll(audits);
            orderRepository.delete(order);
            System.out.println("order deleted" + order.getId());
        } catch (Exception e) {
            // Handle exception
            e.printStackTrace();
            throw new RuntimeException("Failed to archive order and audits: " + e.getMessage());
        }
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

    public List<Order> getOrdersForCurrentUser() {
        return orderRepository.findByCurrentUser(userService.getCurrentUser());
    }

    public List<Order> getAvailableOrdersForMe() {
        User currentUser = userService.getCurrentUser();
        List<String> currentUserRoles = currentUser.getRoles().stream().map(Role::getName).collect(Collectors.toList());

        // Fetch unassigned orders for each role of the current user
        List<Long> stateIds = jobStateRepository.findStateIdsByRoles(currentUserRoles);
        List<Order> availableOrders = orderRepository.findUnassignedOrdersByStateIds(stateIds);

        return availableOrders;
    }

    public void assignOrderToMe(Long orderId) {
        User currentUser = userService.getCurrentUser();
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
