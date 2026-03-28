package com.example.be_phela;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import io.github.cdimascio.dotenv.Dotenv;

import java.io.File;
import java.io.FileInputStream;
import java.util.HashMap;
import java.util.Map;

public class CloudinaryTest {
    public static void main(String[] args) {
        try {
            Dotenv dotenv = Dotenv.configure().directory("./").load();
            String cloudName = dotenv.get("CLOUDINARY_CLOUD_NAME");
            String apiKey = dotenv.get("CLOUDINARY_API_KEY");
            String apiSecret = dotenv.get("CLOUDINARY_API_SECRET");

            System.out.println("Cloud Name: " + cloudName);
            System.out.println("API Key: " + apiKey);

            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", cloudName);
            config.put("api_key", apiKey);
            config.put("api_secret", apiSecret);
            Cloudinary cloudinary = new Cloudinary(config);

            // Test listing resources
            Map result = cloudinary.api().resources(ObjectUtils.asMap(
                    "type", "upload",
                    "prefix", "phelacoffe/Phela/",
                    "max_results", 10
            ));
            System.out.println("Listing resources: " + result);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
