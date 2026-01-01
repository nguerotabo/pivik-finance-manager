package com.pivik.finance_dashboard.controller;

import com.pivik.finance_dashboard.model.Invoice;
import com.pivik.finance_dashboard.repository.InvoiceRepository;
import com.pivik.finance_dashboard.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final ReportService reportService;
    private final Path rootLocation = Paths.get("uploads");

    public InvoiceController(InvoiceRepository invoiceRepository, ReportService reportService) {
        this.invoiceRepository = invoiceRepository;
        this.reportService = reportService;
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @PostMapping("/upload")
    public Invoice uploadInvoice(@RequestParam("file") MultipartFile file) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), rootLocation.resolve(filename));

        Invoice invoice = new Invoice();
        invoice.setFileUrl(filename);
        invoice.setVendor("Unknown Vendor"); 
        invoice.setDate(LocalDate.now());
        invoice.setStatus("On Payment Term");

        return invoiceRepository.save(invoice);
    }

    // Edit Invoice Endpoint
    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice invoiceDetails) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setVendor(invoiceDetails.getVendor());
                    invoice.setInvoiceNumber(invoiceDetails.getInvoiceNumber());
                    invoice.setDate(invoiceDetails.getDate());
                    invoice.setAmount(invoiceDetails.getAmount());
                    invoice.setCategory(invoiceDetails.getCategory());
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setStatus(status);
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceRepository.deleteById(id);
    }

    // PDF Report Download
    @GetMapping("/report")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        byte[] pdfBytes = reportService.generateWeeklyReport(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=weekly_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // ZIP Bundle Download
    @GetMapping("/export-zip")
    public ResponseEntity<byte[]> downloadZipBundle(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        byte[] zipBytes = reportService.generateZipBundle(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Weekly_Payment_Run.zip")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipBytes);
    }
}