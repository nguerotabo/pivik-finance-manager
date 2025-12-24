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
        invoice.setStatus("AI_PROCESSED");

        // Save to Database
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return ResponseEntity.ok(savedInvoice);
    }
}