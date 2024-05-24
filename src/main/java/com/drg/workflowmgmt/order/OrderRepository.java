package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCurrentUser(User currentUser);
}