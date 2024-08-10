package com.drg.workflowmgmt.File;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

@Entity
public class FileEntity {

    @Id
    private String id;

    private String filename;

    private String contentType;

    @Lob
    private byte[] data;

    // Constructors, getters, and setters

    public FileEntity() {}

    public FileEntity(String id, String filename, String contentType, byte[] data) {
        this.id = id;
        this.filename = filename;
        this.contentType = contentType;
        this.data = data;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}
