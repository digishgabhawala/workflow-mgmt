package com.drg.workflowmgmt.workflow;

import jakarta.persistence.Embeddable;
import jakarta.persistence.ElementCollection;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
        DATE("date"),
        BOOLEAN("boolean"),
        FILE("file");



        private final String value;

        FieldType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public boolean validate(String value) {
            switch (this) {
                case TEXT:
                    return true; // Any string is considered valid for text fields
                case NUMBER:
                    return isNumber(value);
                case DATE:
                    return isValidDate(value);
                case BOOLEAN:
                    return isBoolean(value);
                case FILE:
                    return isValidFileUrl(value);
                default:
                    throw new IllegalArgumentException("Unsupported field type: " + this.value);
            }
        }

        private boolean isNumber(String value) {
            try {
                Double.parseDouble(value); // This can handle both integer and decimal numbers
                return true;
            } catch (NumberFormatException e) {
                return false;
            }
        }

        private boolean isValidDate(String value) {
            try {
                LocalTime parse = LocalTime.parse(value, DateTimeFormatter.ISO_LOCAL_TIME);// Example format: "14:30:00"
                return true;
            } catch (DateTimeParseException e) {
                return false;
            }
        }

        private boolean isBoolean(String value) {
            return "true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value);
        }
        private boolean isValidFileUrl(String value) {
            return value != null && !value.trim().isEmpty();
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
