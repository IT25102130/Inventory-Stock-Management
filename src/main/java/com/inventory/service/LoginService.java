package src.main.java.com.inventory.service;

import login.backend.dto.LoginRequest;
import login.backend.dto.LoginResponse;

public interface LoginService {
    LoginResponse authenticate(LoginRequest loginRequest);
}
