package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.usermgmt.UserRepository;
import com.drg.workflowmgmt.workflow.Job;
import com.drg.workflowmgmt.workflow.JobState;
import com.drg.workflowmgmt.workflow.JobStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    public Order createOrder(Order order) {
        if (order.getOrderType() == null ) {
            throw new IllegalArgumentException("Order type and start state are required");
        }

        // Set the current state to the retrieved start state
        order.setCurrentState(order.getOrderType().getStartState());

        // Save the order
        return orderRepository.save(order);
    }

    public Order moveToState(Long orderId, Long nextStateId) {
        // Step 1: Find the order by its ID
        Order order = getOrderById(orderId);

        // Step 2: Get the job associated with the order type
        Job job = order.getOrderType();

        // Step 3: Find the current state of the order
        JobState currentState = order.getCurrentState();

        // Step 4: Retrieve all indexes of fromJobStateIds based on the current state
        List<Integer> fromStateIndexes = IntStream.range(0, job.getFromJobStateIds().size())
                .filter(index -> job.getFromJobStateIds().get(index).equals(currentState.getId()))
                .boxed()
                .collect(Collectors.toList());

        // Step 5: Get the corresponding IDs of toJobStateIds using the indexes
        List<Long> nextStateIds = fromStateIndexes.stream()
                .map(index -> job.getToJobStateIds().get(index))
                .collect(Collectors.toList());

        // Step 6: Validate if the provided nextStateId is part of the list of valid transition states
        if (!nextStateIds.contains(nextStateId)) {
            throw new IllegalArgumentException("Invalid transition state for the current order state.");
        }

        // Step 7: Update the order's current state to the next state and add an audit item
        JobState nextState = jobStateRepository.findById(nextStateId)
                .orElseThrow(() -> new IllegalArgumentException("State not found"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Step 8: Check if the current user's role is allowed for the next state
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

        // Step 9: Save and return the updated order
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
