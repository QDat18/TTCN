package com.example.be_phela.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageService {
    private final Cloudinary cloudinary;
    private static final String BASE_FOLDER = "phelacoffe/Phela/";

    @Autowired
    public FileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String storeFile(MultipartFile file, String subFolder) throws IOException {
        return uploadToCloudinary(file, subFolder);
    }

    public String storeNewsThumbnail(MultipartFile file) throws IOException {
        return uploadToCloudinary(file, "news");
    }

    public String storeBannerImage(MultipartFile file) throws IOException {
        return uploadToCloudinary(file, "banner"); // Updated to match screenshot
    }

    public String storePromotionImage(MultipartFile file) throws IOException {
        return uploadToCloudinary(file, "promotions");
    }

    public String storeChatImage(MultipartFile file) throws IOException {
        return uploadToCloudinary(file, "chat");
    }

    public Map listResources(String folderName) throws Exception {
        String fullPath = BASE_FOLDER + folderName;
        return cloudinary.api().resources(ObjectUtils.asMap(
                "type", "upload",
                "prefix", fullPath,
                "max_results", 100
        ));
    }

    private String uploadToCloudinary(MultipartFile file, String folderName) throws IOException {
        try {
            if (file == null || file.isEmpty()) {
                System.out.println("--- CLOUDINARY DEBUG: File is null or empty");
                return null;
            }

            String fullPath = BASE_FOLDER + folderName;
            System.out.println("--- CLOUDINARY DEBUG: Uploading to: " + fullPath);
            System.out.println("--- CLOUDINARY DEBUG: File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", fullPath
            ));

            System.out.println("--- CLOUDINARY DEBUG: Result: " + uploadResult);

            if (uploadResult != null) {
                String secureUrl = (String) uploadResult.get("secure_url");
                String url = (String) uploadResult.get("url");
                String resultUrl = secureUrl != null ? secureUrl : url;
                System.out.println("--- CLOUDINARY DEBUG: Success URL: " + resultUrl);
                return resultUrl;
            }
            
            System.err.println("--- CLOUDINARY DEBUG: uploadResult is null");
            return null;
        } catch (Exception e) {
            System.err.println("--- CLOUDINARY DEBUG ERROR: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to upload to Cloudinary: " + e.getMessage(), e);
        }
    }
}