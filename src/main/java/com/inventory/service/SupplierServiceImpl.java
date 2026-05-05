package src.main.java.com.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import supplier.backend.dto.SupplierDTO;
import supplier.backend.model.Supplier;
import supplier.backend.repository.SupplierRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
        return convertToDTO(supplier);
    }

    @Override
    @Transactional
    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        Supplier supplier = new Supplier();
        supplier.setName(supplierDTO.getName());
        supplier.setContact(supplierDTO.getContact());
        supplier.setAddress(supplierDTO.getAddress());
        supplier = supplierRepository.save(supplier);
        return convertToDTO(supplier);
    }

    @Override
    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier supplier = supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setName(supplierDTO.getName());
        supplier.setContact(supplierDTO.getContact());
        supplier.setAddress(supplierDTO.getAddress());
        supplier = supplierRepository.save(supplier);
        return convertToDTO(supplier);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setContact(supplier.getContact());
        dto.setAddress(supplier.getAddress());
        return dto;
    }
}
