package com.example.be_phela.service;

import com.example.be_phela.dto.response.BannerResponseDTO;
import com.example.be_phela.model.Banner;
import com.example.be_phela.model.enums.BannerStatus;
import com.example.be_phela.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final FileStorageService fileStorageService;


    @Transactional
    public BannerResponseDTO createBanner(MultipartFile file) throws IOException {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Banner image file is required");
            }
            
            System.out.println("--- DEBUG: Starting banner upload ---");
            String imageUrl = fileStorageService.storeBannerImage(file);
            System.out.println("--- DEBUG: Image URL from Cloudinary: " + imageUrl);
            
            if (imageUrl == null) {
                throw new IOException("Failed to upload banner image to Cloudinary");
            }
            
            LocalDateTime now = LocalDateTime.now();

            Banner banner = Banner.builder()
                    .imageUrl(imageUrl)
                    .status(BannerStatus.ACTIVE)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            System.out.println("--- DEBUG: Saving banner to DB: " + banner);
            Banner savedBanner = bannerRepository.save(banner);
            System.out.println("--- DEBUG: Saved banner ID: " + savedBanner.getBannerId());
            
            return mapToResponseDTO(savedBanner);
        } catch (Exception e) {
            System.err.println("--- DEBUG ERROR in createBanner: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<BannerResponseDTO> getAllBannersForAdmin() {
        return bannerRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BannerResponseDTO updateBannerStatus(String bannerId, BannerStatus status) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + bannerId));

        banner.setStatus(status);
        banner.setUpdatedAt(LocalDateTime.now());

        bannerRepository.save(banner);
        return mapToResponseDTO(banner);
    }

    @Transactional
    public BannerResponseDTO updateBanner(String bannerId, MultipartFile file) throws IOException {
        try {
            Banner banner = bannerRepository.findById(bannerId)
                    .orElseThrow(() -> new RuntimeException("Banner not found with id: " + bannerId));

            if (file != null && !file.isEmpty()) {
                System.out.println("Updating banner image for ID: " + bannerId);
                String imageUrl = fileStorageService.storeBannerImage(file);
                if (imageUrl != null) {
                    banner.setImageUrl(imageUrl);
                }
            }

            banner.setUpdatedAt(LocalDateTime.now());
            Banner updatedBanner = bannerRepository.save(banner);
            return mapToResponseDTO(updatedBanner);
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in updateBanner: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteBanner(String bannerId) {
        if (!bannerRepository.existsById(bannerId)) {
            throw new RuntimeException("Banner not found with id: " + bannerId);
        }
        // có thể xóa ảnh trên cloud
        bannerRepository.deleteById(bannerId);
    }


    @Transactional(readOnly = true)
    public List<BannerResponseDTO> getLatestActiveBanners() {
        return bannerRepository.findTop5ByStatusOrderByCreatedAtDesc(BannerStatus.ACTIVE)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    private BannerResponseDTO mapToResponseDTO(Banner banner) {
        return BannerResponseDTO.builder()
                .bannerId(banner.getBannerId())
                .imageUrl(banner.getImageUrl())
                .createdAt(banner.getCreatedAt())
                .status(banner.getStatus())
                .build();
    }
}