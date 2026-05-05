package src.main.java.com.inventory.service;

import login.backend.dto.LoginRequest;
import login.backend.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import user.backend.model.User;
import user.backend.repository.UserRepository;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public LoginResponse authenticate(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
                
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        
        return new LoginResponse(true, "Login successful", roleName, user.getUsername());
    }
}
