package src.main.java.com.inventory.service;

import src.main.java.com.inventory.dto.LoginRequest;
import src.main.java.com.inventory.dto.LoginResponse;

public interface LoginService {
    LoginResponse authenticate(LoginRequest loginRequest);
}
}