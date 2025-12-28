package com.pivik.finance_dashboard.repository;

import com.pivik.finance_dashboard.model.Invoice;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// This interface facilitates the use of our database
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    // Spring automatically gives us: save(), findAll(), findById(), delete()

    
    // Find invoices between two dates (inclusive)
    
    List<Invoice> findByDateBetween(LocalDate startDate, LocalDate endDate);
}