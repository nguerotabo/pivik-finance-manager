package com.pivik.finance_dashboard.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pivik.finance_dashboard.model.Invoice;
import com.pivik.finance_dashboard.repository.InvoiceRepository;
import com.pivik.finance_dashboard.service.OpenAiService;
import com.pivik.finance_dashboard.service.PdfExtractionService; // 👈 Using your existing service
import com.pivik.finance_dashboard.service.ReportService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final ReportService reportService;
    private final OpenAiService openAiService;
    private final PdfExtractionService pdfExtractionService; // 👈 Your specific service
    private final Path rootLocation = Paths.get("uploads");

    // Constructor Injection
    public InvoiceController(InvoiceRepository invoiceRepository, 
                             ReportService reportService, 
                             OpenAiService openAiService, 
                             PdfExtractionService pdfExtractionService) {
        this.invoiceRepository = invoiceRepository;
        this.reportService = reportService;
        this.openAiService = openAiService;
        this.pdfExtractionService = pdfExtractionService;

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

    // 📤 UPLOAD + AI ANALYSIS
    @PostMapping("/upload")
    public Invoice uploadInvoice(@RequestParam("file") MultipartFile file) throws IOException {
        // 1. Save the File to Disk
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destinationFile = rootLocation.resolve(filename);
        Files.copy(file.getInputStream(), destinationFile);

        // 2. Extract Text (Using YOUR service with the file path)
        // We convert Path to String because your service expects a String
        String invoiceText = pdfExtractionService.extractText(destinationFile.toAbsolutePath().toString());
        
        System.out.println("📄 Extracted Text: " + (invoiceText.length() > 50 ? invoiceText.substring(0, 50) + "..." : invoiceText));

        // 3. Create Default Invoice Object
        Invoice invoice = new Invoice();
        invoice.setFileUrl(filename);
        invoice.setStatus("On Payment Term");

        // 4. AI Analysis
        if (invoiceText != null && !invoiceText.isEmpty() && !invoiceText.startsWith("Error")) {
            String jsonResponse = openAiService.extractInvoiceDetails(invoiceText);
            
            if (jsonResponse != null) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(jsonResponse);

                    // Safely fill fields
                    if (root.has("vendor")) invoice.setVendor(root.get("vendor").asText());
                    if (root.has("invoiceNumber")) invoice.setInvoiceNumber(root.get("invoiceNumber").asText());
                    if (root.has("amount")) invoice.setAmount(root.get("amount").asDouble());
                    if (root.has("category")) invoice.setCategory(root.get("category").asText());
                    
                    if (root.has("date")) {
                        invoice.setDate(LocalDate.parse(root.get("date").asText()));
                    } else {
                        invoice.setDate(LocalDate.now());
                    }
                } catch (Exception e) {
                    System.out.println("❌ AI Parse Error: " + e.getMessage());
                    invoice.setVendor("Unknown (Parse Error)");
                    invoice.setDate(LocalDate.now());
                }
            } else {
                invoice.setVendor("Unknown (AI Failed)");
                invoice.setDate(LocalDate.now());
            }
        } else {
            invoice.setVendor("Unknown (PDF Empty)");
            invoice.setDate(LocalDate.now());
        }

        return invoiceRepository.save(invoice);
    }

    // ✏️ EDIT INVOICE
    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice invoiceDetails) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setVendor(invoiceDetails.getVendor());
                    invoice.setInvoiceNumber(invoiceDetails.getInvoiceNumber());
                    invoice.setDate(invoiceDetails.getDate());
                    invoice.setAmount(invoiceDetails.getAmount());
                    invoice.setCategory(invoiceDetails.getCategory());
                    invoice.setProject(invoiceDetails.getProject());
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setStatus(status);
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceRepository.deleteById(id);
    }

    // 📄 PDF REPORT
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

    // 📦 ZIP EXPORT
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

    // 📂 DOWNLOAD SINGLE FILE
    @GetMapping("/file/{filename}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
}