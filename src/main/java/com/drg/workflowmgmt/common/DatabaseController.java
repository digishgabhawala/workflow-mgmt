package com.drg.workflowmgmt.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import java.util.ArrayList;
import java.util.List;

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
}
