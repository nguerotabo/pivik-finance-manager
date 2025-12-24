package com.pivik.finance_dashboard.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service // Tells Spring: "This is a utility worker"
public class FileStorageService {

    // The folder where files will live
    private final Path storageLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(storageLocation);
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory!");
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            // 1. Give it a unique name (uuid-filename.pdf)
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            
            // 2. Figure out the destination path
            Path targetLocation = this.storageLocation.resolve(fileName);
            
            // 3. Copy the bits! (StandardCopyOption.REPLACE_EXISTING handles duplicates)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }
}