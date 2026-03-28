package com.example.be_phela.controller;

import com.example.be_phela.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class MediaController {

    private final FileStorageService fileStorageService;

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listMedia(@RequestParam(defaultValue = "banner") String folder) {
        try {
            Map result = fileStorageService.listResources(folder);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving media: " + e.getMessage());
        }
    }
}
