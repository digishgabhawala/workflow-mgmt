package com.drg.workflowmgmt.workflow;

import jakarta.persistence.Embeddable;
import jakarta.persistence.ElementCollection;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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
    public enum FieldType {
        TEXT("text"),
        NUMBER("number"),
        DATE("date");

        private final String value;

        FieldType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public class FieldTypeList {

        public static List<String> getSupportedFieldTypes() {
            return Arrays.stream(FieldType.values())
                    .map(FieldType::getValue)
                    .collect(Collectors.toList());
        }
    }
}
