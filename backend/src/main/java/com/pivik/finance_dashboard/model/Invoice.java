package com.pivik.finance_dashboard.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDate;


@Entity
@Data // automatically creates my getters, setters, and tostring().
public class Invoice {

    // @Id tells Spring: "This is the Primary Key"
    // @GeneratedValue means: "Auto-increment this number (1, 2, 3...)"
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The field of my table
    private String vendor;       //
    private Double amount;       //
    private LocalDate date;      // date
    private String category;     // snacks, drinks?
    private String status;       // pending or paid
    private String fileUrl;   // link to the file    
}     