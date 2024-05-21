package com.drg.workflowmgmt;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    @GetMapping("/admin/admin")
    public String hello() {
        // Get the authentication object from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Get the username of the authenticated user
        String username = authentication.getName();

        // Return the "Hello World" message along with the username
        return "Hello " + username + "!";
    }
}
