package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.workflow.AdditionalField;
import com.drg.workflowmgmt.workflow.Job;
import com.drg.workflowmgmt.workflow.JobService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

public class OrderServiceTest {

    @Mock
    private JobService jobService;

    @InjectMocks
    private OrderService orderService;

    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        objectMapper = new ObjectMapper();
        // Manually inject the ObjectMapper into the OrderService
        orderService.objectMapper = objectMapper;
    }

    @Test
    public void testValidateAdditionalFields_ValidFields() throws JsonProcessingException {
        String additionalFieldsJson = "{\"field1\":\"value1\", \"field2\":10}";
        AdditionalField field = new AdditionalField();
        field.setFieldName("field1");
        field.setFieldType("string");
        AdditionalField field1 = new AdditionalField();
        field1.setFieldType("integer");
        field1.setFieldName("field2");
        Job job = createMockJob(Arrays.asList(
                field,
                field1
        ));

        orderService.validateAdditionalFields(additionalFieldsJson, job);
    }

    @Test
    public void testValidateAdditionalFields_InvalidFieldName() throws JsonProcessingException {
        String additionalFieldsJson = "{\"invalidField\":\"value\"}";
        AdditionalField additionalField = new AdditionalField();
        additionalField.setFieldName("field1");
        additionalField.setFieldType("string");

        Job job = createMockJob(Collections.singletonList(
                additionalField
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            orderService.validateAdditionalFields(additionalFieldsJson, job);
        });
    }

    @Test
    public void testValidateAdditionalFields_InvalidFieldType() throws JsonProcessingException {
        String additionalFieldsJson = "{\"field1\":10}";
        AdditionalField additionalField = new AdditionalField();
        additionalField.setFieldName("field1");
        additionalField.setFieldType("string");

        Job job = createMockJob(Collections.singletonList(
                additionalField
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            orderService.validateAdditionalFields(additionalFieldsJson, job);
        });
    }

    @Test
    public void testValidateAdditionalFields_MissingMandatoryField() throws JsonProcessingException {
        String additionalFieldsJson = "{\"field2\":10}";
        AdditionalField field1 = new AdditionalField();
        field1.setFieldName("field1");
        field1.setFieldType("string");
        field1.setMandatory(true); // This field is mandatory

        AdditionalField field2 = new AdditionalField();
        field2.setFieldType("integer");
        field2.setFieldName("field2");

        Job job = createMockJob(Arrays.asList(
                field1,
                field2
        ));

        assertThrows(IllegalArgumentException.class, () -> {
            orderService.validateAdditionalFields(additionalFieldsJson, job);
        });
    }

    @Test
    public void testValidateAdditionalFields_InvalidJson() throws JsonProcessingException {
        String additionalFieldsJson = "invalidJson";

        assertThrows(IllegalArgumentException.class, () -> {
            orderService.validateAdditionalFields(additionalFieldsJson, null);
        });
    }

    private Job createMockJob(List<AdditionalField> additionalFields) {
        Job job = new Job();
        job.setAdditionalFields(additionalFields);
        return job;
    }
}
