package com.pivik.finance_dashboard.controller;

import com.pivik.finance_dashboard.model.Invoice;
import com.pivik.finance_dashboard.repository.InvoiceRepository;
import com.pivik.finance_dashboard.service.FileStorageService;
import com.pivik.finance_dashboard.service.PdfExtractionService;
import com.pivik.finance_dashboard.service.OpenAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pivik.finance_dashboard.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private PdfExtractionService pdfExtractionService;

    @Autowired
    private OpenAiService openAiService;

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @PostMapping("/upload")
    public ResponseEntity<Invoice> uploadInvoice(@RequestParam("file") MultipartFile file) {
        // Save File
        String fileName = fileStorageService.storeFile(file);
        
        // Read PDF 
        String extractedText = pdfExtractionService.extractText("uploads/" + fileName);
        
        // Get Clean JSON from AI
        String jsonResponse = openAiService.extractInvoiceDetails(extractedText);
        System.out.println("Clean JSON from AI: " + jsonResponse);

        // Convert JSON String to Invoice Object
        Invoice invoice = new Invoice();
        try {
            // Creates maches between JSON and Java
            invoice = objectMapper.readValue(jsonResponse, Invoice.class);
        } catch (Exception e) {
            System.out.println("Error parsing JSON: " + e.getMessage());
            // If parsing fails, we still want to save the file, just with empty data
            invoice.setVendor("Parsing Error");
        }

        // Add the file link and status
        invoice.setFileUrl(fileName);
        invoice.setStatus("On Payment Term");

        // Save to Database
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return ResponseEntity.ok(savedInvoice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        if (invoiceRepository.existsById(id)) {
            invoiceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @Autowired
    private ReportService reportService; 

    @GetMapping("/report")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        
        // Convert String (from frontend) to LocalDate (for Java)
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        byte[] pdfBytes = reportService.generateWeeklyReport(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=weekly_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    //  Update Status Endpoint
    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setStatus(status);
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Download ZIP bundle
    @GetMapping("/export-zip")
    public ResponseEntity<byte[]> downloadZipBundle(
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {
        
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);

        byte[] zipBytes = reportService.generateZipBundle(startDate, endDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Weekly_Payment_Run.zip")
                .contentType(MediaType.APPLICATION_OCTET_STREAM) // Use generic binary type for Zip
                .body(zipBytes);
    }
}