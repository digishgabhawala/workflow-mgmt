package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCurrentUser(User currentUser);
    @Query("SELECT o FROM Order o WHERE o.currentUser IS NULL AND o.currentState.id IN :stateIds")
    List<Order> findUnassignedOrdersByStateIds(@Param("stateIds") List<Long> stateIds);
}