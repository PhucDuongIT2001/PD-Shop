package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.region:ap-southeast-1}")
    private String region;

    @Value("${file.base-url:http://localhost:8080}")
    private String baseUrl;

    private S3Client s3Client;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostConstruct
    public void initS3() {
        if (accessKey != null && !accessKey.trim().isEmpty() &&
            secretKey != null && !secretKey.trim().isEmpty() &&
            bucketName != null && !bucketName.trim().isEmpty()) {
            
            try {
                logger.info("Initializing AWS S3 Client for bucket: {} in region: {}", bucketName, region);
                AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey.trim(), secretKey.trim());
                this.s3Client = S3Client.builder()
                        .credentialsProvider(StaticCredentialsProvider.create(credentials))
                        .region(Region.of(region.trim()))
                        .build();
                logger.info("AWS S3 Client successfully initialized.");
            } catch (Exception e) {
                logger.error("Failed to initialize AWS S3 Client: {}. Local file storage fallback will be active.", e.getMessage());
                this.s3Client = null;
            }
        } else {
            logger.info("AWS S3 credentials not fully configured or missing. Using local file storage.");
            this.s3Client = null;
        }
    }

    public String storeFile(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        // Generate a unique file name to prevent conflicts
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Try to upload to S3 if initialized
        if (s3Client != null) {
            try {
                String s3Key = subDir + "/" + fileName;
                logger.info("Uploading file {} to AWS S3 bucket {} as {}", fileName, bucketName, s3Key);

                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Key)
                        .contentType(file.getContentType())
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                
                String s3Url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, s3Key);
                logger.info("Successfully uploaded file to AWS S3: {}", s3Url);
                return s3Url;
            } catch (Exception ex) {
                logger.error("Failed to upload file to S3: {}. Falling back to local file storage.", ex.getMessage());
            }
        }

        // Local Storage Fallback
        try {
            Path targetDirectory = this.fileStorageLocation.resolve(subDir);
            Files.createDirectories(targetDirectory); // Ensure subdirectory exists
            
            Path targetLocation = targetDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return full URL so model-viewer and browsers can load the file directly
            String cleanBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            return cleanBase + "/uploads/" + subDir + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }
}
