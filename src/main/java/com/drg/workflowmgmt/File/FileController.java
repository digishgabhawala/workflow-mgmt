package com.drg.workflowmgmt.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileId = fileService.storeFile(file);
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/files/download/")
                .path(fileId)
                .toUriString();

        // Create a map to hold the response data
        Map<String, Object> response = new HashMap<>();
        response.put("fileId", fileId);
        response.put("fileDownloadUri", fileDownloadUri);
        response.put("fileName", file.getOriginalFilename());
        response.put("fileType", file.getContentType());
        response.put("size", file.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId) {
        Resource file = fileService.loadFileAsResource(fileId);
        String originalFilename = fileService.getOriginalFilename(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFilename + "\"")
                .body(file);
    }

    @GetMapping("/icon/{fileId}")
    public ResponseEntity<Resource> getFileIcon(@PathVariable String fileId) {
        Resource icon = fileService.loadFileIconAsResource(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(icon);
    }

}
