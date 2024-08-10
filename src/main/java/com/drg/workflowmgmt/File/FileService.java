package com.drg.workflowmgmt.File;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    public String storeFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the maximum limit of 5 MB");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if(! file.getContentType().equals(MediaType.APPLICATION_PDF_VALUE) && !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only PDF and image files are allowed");
        }

        String fileId = UUID.randomUUID().toString();
        try {
            FileEntity fileEntity = new FileEntity(
                    fileId,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes()
            );
            fileRepository.save(fileEntity);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        return fileId;
    }

    public Resource loadFileAsResource(String fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found with id " + fileId));

        return new ByteArrayResource(fileEntity.getData());
    }

    public Resource loadFileIconAsResource(String fileId) {
        FileEntity fileEntity = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found with id " + fileId));

        try {
            // Check if the file is an image (you may want to improve this check)
            if (fileEntity.getContentType() != null && fileEntity.getContentType().startsWith("image/")) {
                // Convert byte array to BufferedImage
                BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(fileEntity.getData()));

                // Resize the image to a thumbnail (say 100x100 pixels)
                BufferedImage thumbnail = Scalr.resize(originalImage, 100);

                // Convert BufferedImage back to byte array
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(thumbnail, "png", baos); // Using PNG format for thumbnail

                return new ByteArrayResource(baos.toByteArray());
            } else {
                // Return a generic icon or a specific icon based on file type
                // For simplicity, returning a generic "file" icon here
                byte[] iconData = loadGenericFileIcon();
                return new ByteArrayResource(iconData);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate file icon", e);
        }
    }

    private byte[] loadGenericFileIcon() {
        try {
            return getClass().getResourceAsStream("/icons/addFile.png").readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to load generic file icon", e);
        }
    }

    public String getOriginalFilename(String fileId) {
        return fileRepository.findById(fileId)
                .map(FileEntity::getFilename)
                .orElse(null);
    }
}
