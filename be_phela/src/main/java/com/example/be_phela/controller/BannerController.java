package com.example.be_phela.controller;

import com.example.be_phela.dto.response.BannerResponseDTO;
import com.example.be_phela.model.enums.BannerStatus;
import com.example.be_phela.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // =============================
    // == ENDPOINTS FOR ADMIN ======
    // =============================

    @PostMapping(value = "/admin/banners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BannerResponseDTO> createBanner(@RequestParam("file") MultipartFile file) throws IOException {
        BannerResponseDTO createdBanner = bannerService.createBanner(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBanner);
    }

    @GetMapping("/admin/banners")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<BannerResponseDTO>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBannersForAdmin());
    }

    @PatchMapping("/admin/banners/{bannerId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BannerResponseDTO> updateBannerStatus(
            @PathVariable String bannerId,
            @RequestParam("status") BannerStatus status) {
        return ResponseEntity.ok(bannerService.updateBannerStatus(bannerId, status));
    }

    @PutMapping(value = "/admin/banners/{bannerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BannerResponseDTO> updateBanner(
            @PathVariable String bannerId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(bannerService.updateBanner(bannerId, file));
    }

    @DeleteMapping("/admin/banners/{bannerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteBanner(@PathVariable String bannerId) {
        bannerService.deleteBanner(bannerId);
        return ResponseEntity.noContent().build();
    }


    // =============================
    // == ENDPOINTS FOR CUSTOMER ===
    // =============================

    @GetMapping("/banners/latest")
    public ResponseEntity<List<BannerResponseDTO>> getLatestBanners() {
        return ResponseEntity.ok(bannerService.getLatestActiveBanners());
    }
}