package com.drg.workflowmgmt;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LogoutController {

    @GetMapping("/l34ogout")
    public String logout() {
        return "redirect:/perform_logout";
    }
}
