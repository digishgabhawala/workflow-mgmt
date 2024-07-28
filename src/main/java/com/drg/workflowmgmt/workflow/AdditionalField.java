package com.drg.workflowmgmt.workflow;

import jakarta.persistence.Embeddable;
import jakarta.persistence.ElementCollection;

@Embeddable
public class AdditionalField {
    private String fieldName;
    private String fieldType;
    private String partOfForm;
    private boolean mandatory;

    // Constructors, getters, and setters
    public AdditionalField() {}

    public AdditionalField(String fieldName, String fieldType, String partOfForm, boolean mandatory) {
        this.fieldName = fieldName;
        this.fieldType = fieldType;
        this.partOfForm = partOfForm;
        this.mandatory = mandatory;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getFieldType() {
        return fieldType;
    }

    public void setFieldType(String fieldType) {
        this.fieldType = fieldType;
    }

    public String getPartOfForm() {
        return partOfForm;
    }

    public void setPartOfForm(String partOfForm) {
        this.partOfForm = partOfForm;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }
}