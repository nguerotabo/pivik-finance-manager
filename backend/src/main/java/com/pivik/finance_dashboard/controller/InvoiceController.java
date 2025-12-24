package com.pivik.finance_dashboard.controller;

import com.pivik.finance_dashboard.model.Invoice;
import com.pivik.finance_dashboard.repository.InvoiceRepository;
import com.pivik.finance_dashboard.service.FileStorageService;
import com.pivik.finance_dashboard.service.PdfExtractionService;
import com.pivik.finance_dashboard.service.OpenAiService;
import com.fasterxml.jackson.databind.ObjectMapper;

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
        // 1. Save File
        String fileName = fileStorageService.storeFile(file);
        
        // 2. Read PDF (OCR)
        String extractedText = pdfExtractionService.extractText("uploads/" + fileName);
        
        // 3. Get Clean JSON from AI
        String jsonResponse = openAiService.extractInvoiceDetails(extractedText);
        System.out.println("Clean JSON from AI: " + jsonResponse);

        // 4. NEW: Convert JSON String -> Invoice Object
        Invoice invoice = new Invoice();
        try {
            // This magic line fills the invoice object with data from the JSON string!
            // It matches "vendor" in JSON to "vendor" in Java.
            invoice = objectMapper.readValue(jsonResponse, Invoice.class);
        } catch (Exception e) {
            System.out.println("Error parsing JSON: " + e.getMessage());
            // If parsing fails, we still want to save the file, just with empty data
            invoice.setVendor("Parsing Error");
        }

        // 5. Add the file link and Status
        invoice.setFileUrl(fileName);
        invoice.setStatus("AI_PROCESSED");

        // 6. Save to Database
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return ResponseEntity.ok(savedInvoice);
    }
}