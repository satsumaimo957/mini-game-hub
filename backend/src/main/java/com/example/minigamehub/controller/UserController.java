package com.example.minigamehub.controller;

import com.example.minigamehub.dto.UserDashboardResponse;
import com.example.minigamehub.service.UserDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserDashboardService userDashboardService;

    public UserController(UserDashboardService userDashboardService) {
        this.userDashboardService = userDashboardService;
    }

    @GetMapping("/me/dashboard")
    public UserDashboardResponse dashboard() {
        return userDashboardService.getDashboard();
    }
}
