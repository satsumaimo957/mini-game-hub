package com.example.minigamehub.service;

import com.example.minigamehub.dto.AuthResponse;
import com.example.minigamehub.dto.LoginRequest;
import com.example.minigamehub.dto.RegisterRequest;
import com.example.minigamehub.dto.UserResponse;
import com.example.minigamehub.entity.Role;
import com.example.minigamehub.entity.User;
import com.example.minigamehub.repository.UserRepository;
import com.example.minigamehub.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CurrentUserService currentUserService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("このメールアドレスはすでに登録されています。");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("このユーザー名はすでに使われています。");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("メールアドレスまたはパスワードが正しくありません。"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("メールアドレスまたはパスワードが正しくありません。");
        }

        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public UserResponse me() {
        return UserResponse.from(currentUserService.getCurrentUser());
    }
}
