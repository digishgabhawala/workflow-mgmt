package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.File.FileService;
import com.drg.workflowmgmt.usermgmt.Role;
import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.usermgmt.UserRepository;
import com.drg.workflowmgmt.usermgmt.UserService;
import com.drg.workflowmgmt.workflow.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.drg.workflowmgmt.workflow.AdditionalField.*;

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

    @Autowired
    private FileService fileService;

    @Autowired
    protected ObjectMapper objectMapper;

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
        if (orderTypeJob.isArchived()) {
            throw new IllegalArgumentException("Cannot create order for archived job type");
        }
        validateAdditionalFields(order.getAdditionalFields(), orderTypeJob);

        order.setOrderType(orderTypeJob);
        order.setCurrentState(order.getOrderType().getStartState());

        return orderRepository.save(order);
    }

    public Order moveToState(Long orderId, Long nextStateId) {
        return moveToState(orderId, nextStateId, LocalDateTime.now());
    }

    public Order moveToState(Long orderId, Long nextStateId, LocalDateTime time) {
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
        audit.setTimestamp(time);
        audit.setUser(currentUser);
        audit.setUserRole(currentUser.getRoles().iterator().next().getName());
        audit.setFromState(currentState);
        audit.setToState(nextState);
        audit.setNote(order.getNote());
        order.getAuditItems().add(audit);

        order.setCurrentState(nextState);
        order.setCurrentUser(null);

        if (nextState.getId().equals(order.getOrderType().getEndState().getId())) {
            archiveOrderAndAudits(order, time);
            return order;
        } else {
            return orderRepository.save(order);
        }

    }

    @Transactional
    private void archiveOrderAndAudits(Order order, LocalDateTime time) {
        try {
            // Archive order
            ArchivedOrder archivedOrder = new ArchivedOrder();
            archivedOrder.setArchivedAt(time);
            archivedOrder.setId(order.getId());
            archivedOrder.setOrderType(order.getOrderType().getName());
            archivedOrder.setCurrentState(order.getCurrentState().getName());
            archivedOrder.setNote(order.getNote());
            archivedOrder.setPriority(order.getPriority());
            archivedOrder.setCreationDate(order.getTimestamp());
            if (null != order.getOwnerDetails()) {
                OwnerDetails ownerDetails = new OwnerDetails();
                ownerDetails.setOwnerName(order.getOwnerDetails().getOwnerName());
                ownerDetails.setOwnerAddress(order.getOwnerDetails().getOwnerAddress());
                ownerDetails.setOwnerEmail(order.getOwnerDetails().getOwnerEmail());
                ownerDetails.setOwnerMobile(order.getOwnerDetails().getOwnerMobile());
                archivedOrder.setOwnerDetails(ownerDetails);
                archivedOrder.setAmount(order.getAmount());
            }
            archivedOrder.setAdditionalFields(order.getAdditionalFields());

            // Archive related audits
            List<Audit> audits = order.getAuditItems();
            List<ArchivedAudit> archivedAudits = new ArrayList<>();
            for (Audit audit : audits) {
                ArchivedAudit archivedAudit = new ArchivedAudit();
                archivedAudit.setId(audit.getId());
                archivedAudit.setArchivedAt(audit.getTimestamp());
                archivedAudit.setUserId(audit.getUser().getId());
                archivedAudit.setFromStateId(audit.getFromState().getId());
                archivedAudit.setToStateId(audit.getToState().getId());
                archivedAudits.add(archivedAudit);
            }
            archivedOrder.setAuditItems(archivedAudits);

            // Save the archived order
            archivedOrderRepository.save(archivedOrder);

            // Delete order and related audits
            auditRepository.deleteAll(audits);
            deleteFileIfExists(order);
            orderRepository.delete(order);
        } catch (Exception e) {
            // Handle exception
            e.printStackTrace();
            throw new RuntimeException("Failed to archive order and audits: " + e.getMessage());
        }
    }

    private void deleteFileIfExists(Order order) {
        //get through all additional Fields and find if there is any file
        //if there is any file then delete it
        List<String> fileIds = getFileIds(order);
        for (String fileId : fileIds) {
            fileService.deleteFile(fileId);
        }
    }

    public List<String> getFileIds(Order order){
        List<String> fileIds = new ArrayList<>();
        Map<String, Object> additionalFields = null;
        try {
            additionalFields = objectMapper.readValue(order.getAdditionalFields(), new TypeReference<Map<String, Object>>() {});
            for (Map.Entry<String, Object> entry : additionalFields.entrySet()) {
                if (isFileType(entry.getValue())) {
                    fileIds.add(((String) entry.getValue()).substring("/files/download/".length()));
                }
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return fileIds;
    }

    private boolean isFileType(Object value) {
        // Implement logic to check if the value is a file ID or URL
        return value instanceof String && ((String) value).startsWith("/files/download/");
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

    public List<ArchivedOrder> getAllArchivedOrders() {
        return archivedOrderRepository.findAll();
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        List<Audit> audits = order.getAuditItems();
        auditRepository.deleteAll(audits);
        orderRepository.delete(order);
    }

    public boolean existsByOrderType(Job job) {
        return orderRepository.existsByOrderType(job);
    }

    protected void validateAdditionalFields(String additionalFieldsJson, Job jobType) {
        try {
            // Parse the JSON string into a Map
            Map<String, Object> additionalFields = objectMapper.readValue(additionalFieldsJson, new TypeReference<Map<String, Object>>() {});

            // Collect the expected field names
            Set<String> expectedFieldNames = jobType.getAdditionalFields().stream()
                    .map(AdditionalField::getFieldName)
                    .collect(Collectors.toSet());

            // Validate presence and type of mandatory fields
            for (AdditionalField field : jobType.getAdditionalFields()) {
                String fieldName = field.getFieldName();
                boolean isFieldPresent = additionalFields.containsKey(fieldName);

                if (field.isMandatory() && !isFieldPresent) {
                    throw new IllegalArgumentException("Missing mandatory additional field: " + fieldName);
                }

                if (isFieldPresent && !validateFieldType(field.getFieldType(), additionalFields.get(fieldName))) {
                    throw new IllegalArgumentException("Invalid additional field: " + fieldName);
                }
            }

            // Validate that no extra fields are present in the JSON input
            for (String fieldName : additionalFields.keySet()) {
                if (!expectedFieldNames.contains(fieldName)) {
                    throw new IllegalArgumentException("Invalid additional field: " + fieldName);
                }
            }
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid JSON for additional fields", e);
        }
    }


    private boolean validateFieldType(String expectedType, Object value) {
        try {
            FieldType fieldType = FieldType.valueOf(expectedType.toUpperCase());
            return fieldType.validate(value.toString());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported field type: " + expectedType, e);
        }
    }
}

