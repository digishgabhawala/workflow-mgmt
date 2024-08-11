package com.drg.workflowmgmt.common;

import com.drg.workflowmgmt.File.FileService;
import com.drg.workflowmgmt.order.Order;
import com.drg.workflowmgmt.order.OrderService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.*;

@RestController
@RequestMapping("/db")
public class DatabaseController {
    @Autowired
    private DataSource dataSource;

    @GetMapping("/export")
    public ResponseEntity<Resource> exportDatabase() throws Exception {
        String sqlFile = "backup.sql";
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SCRIPT TO '" + sqlFile + "'");
        }

        byte[] data = new byte[(int) new File(sqlFile).length()];
        try (FileInputStream fis = new FileInputStream(sqlFile)) {
            fis.read(data);
        }

        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + sqlFile)
                .contentType(MediaType.parseMediaType("application/sql"))
                .body(resource);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importDatabase(@RequestPart("file") MultipartFile file) throws Exception {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Disable foreign key constraints
            stmt.execute("SET REFERENTIAL_INTEGRITY FALSE");

            // Drop all tables
            List<String> tableNames = getTableNames(conn);
            for (String tableName : tableNames) {
                stmt.execute("DROP TABLE IF EXISTS \"" + tableName + "\" CASCADE");
            }

            // Read and execute the SQL script
            String line;
            StringBuilder sql = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                sql.append(line).append("\n");
            }
            stmt.execute(sql.toString());

            // Enable foreign key constraints
            stmt.execute("SET REFERENTIAL_INTEGRITY TRUE");
        }

        return ResponseEntity.ok("Database restored successfully");
    }

    private List<String> getTableNames(Connection conn) throws Exception {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
            List<String> tableNames = new ArrayList<>();
            while (rs.next()) {
                tableNames.add(rs.getString(1));
            }
            return tableNames;
        }
    }

    @Autowired
    private OrderService orderService;

    @Autowired
    private FileService fileService;

    @Autowired
    protected ObjectMapper objectMapper;


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/cleanup-files")
    public ResponseEntity<String> cleanupFiles() {
        // Fetch all orders
        List<Order> allOrders = orderService.getAllOrders();

        // Collect all file IDs from additionalFields
        Set<String> fileIdsToKeep = new HashSet<>();
        for (Order order : allOrders) {
            fileIdsToKeep.addAll(orderService.getFileIds(order));
        }
        // Delete files that are not in fileIdsToKeep
        fileService.cleanupFiles(fileIdsToKeep);


        return ResponseEntity.ok("File cleanup completed successfully");
    }

    private boolean isFileType(Object value) {
        // Implement logic to check if the value is a file ID or URL
        return value instanceof String && ((String) value).startsWith("/files/download/");
    }
}
