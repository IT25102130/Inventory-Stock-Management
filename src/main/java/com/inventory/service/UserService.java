package src.main.java.com.inventory.service;

import src.main.java.com.inventory.dto.UserDTO;
import src.main.java.com.inventory.model.Role;

import java.util.List;

public interface UserService {
    List<Role> getAllRoles();
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long id);
    UserDTO createUser(UserDTO userDTO);
    UserDTO updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);
}