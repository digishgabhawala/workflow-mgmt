package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.usermgmt.UserRepository;
import com.drg.workflowmgmt.workflow.JobState;
import com.drg.workflowmgmt.workflow.JobStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JobStateRepository jobStateRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    public Order createOrder(Order order) {
        if (order.getOrderType() == null || order.getCurrentState() == null) {
            throw new IllegalArgumentException("Order type and current state are required");
        }
        return orderRepository.save(order);
    }

    public Order moveToState(Long orderId, Long nextStateId) {
        Order order = getOrderById(orderId);

        JobState nextState = jobStateRepository.findById(nextStateId)
                .orElseThrow(() -> new IllegalArgumentException("State not found"));

        if (!order.getOrderType().getJobStates().contains(nextState)) {
            throw new IllegalArgumentException("State is not valid for the given order type.");
        }

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Create and add a new audit item
        Audit audit = new Audit();
        audit.setUser(currentUser);
        audit.setUserRole(currentUser.getRoles().iterator().next().getName());
        audit.setFromState(order.getCurrentState());
        audit.setToState(nextState);
        audit.setNote("Moved to state " + nextState.getName());

        order.getAuditItems().add(audit);
        order.setCurrentState(nextState);

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

    public List<Order> getOrdersForCurrentUser() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return orderRepository.findByCurrentUser(currentUser);
    }
}
