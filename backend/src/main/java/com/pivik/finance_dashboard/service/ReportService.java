package com.pivik.finance_dashboard.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.pivik.finance_dashboard.model.Invoice;
import com.pivik.finance_dashboard.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ReportService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public byte[] generateWeeklyReport(LocalDate startDate, LocalDate endDate) {
        // 1. Fetch Invoices for the specific week
        List<Invoice> invoices = invoiceRepository.findByDateBetween(startDate, endDate);

        // 2. Group invoices by Vendor (Vendor -> List of Invoices)
        Map<String, List<Invoice>> invoicesByVendor = invoices.stream()
                .collect(Collectors.groupingBy(Invoice::getVendor));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // --- REPORT TITLE ---
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Weekly Payment Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            Paragraph dateRange = new Paragraph("Period: " + startDate + " to " + endDate);
            dateRange.setAlignment(Element.ALIGN_CENTER);
            document.add(dateRange);
            document.add(new Paragraph(" ")); // Spacer

            double grandTotal = 0;

            // --- LOOP THROUGH EACH VENDOR ---
            for (Map.Entry<String, List<Invoice>> entry : invoicesByVendor.entrySet()) {
                String vendorName = entry.getKey();
                List<Invoice> vendorInvoices = entry.getValue();

                // 1. Vendor Header (Big Text)
                Paragraph vendorHeader = new Paragraph(vendorName.toUpperCase(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
                vendorHeader.setSpacingBefore(10);
                document.add(vendorHeader);

                // 2. The Table for this Vendor
                PdfPTable table = new PdfPTable(3); // Cols: Date | Invoice # | Amount
                table.setWidthPercentage(100);
                table.setSpacingBefore(5);

                // Table Headers
                addHeader(table, "Date");
                addHeader(table, "Invoice #");
                addHeader(table, "Amount");

                double vendorTotal = 0;

                // 3. List every invoice for this vendor
                for (Invoice inv : vendorInvoices) {
                    table.addCell(inv.getDate() != null ? inv.getDate().toString() : "N/A");
                    table.addCell(inv.getInvoiceNumber() != null ? inv.getInvoiceNumber() : "N/A");
                    table.addCell("$" + String.format("%.2f", inv.getAmount()));
                    
                    vendorTotal += (inv.getAmount() != null ? inv.getAmount() : 0);
                }

                document.add(table);

                // 4. Vendor Subtotal
                Paragraph subtotal = new Paragraph("Total for " + vendorName + ": $" + String.format("%.2f", vendorTotal));
                subtotal.setAlignment(Element.ALIGN_RIGHT);
                subtotal.setSpacingAfter(10);
                document.add(subtotal);
                
                // Add faint line separator
                document.add(new Paragraph("----------------------------------------------------------------"));

                grandTotal += vendorTotal;
            }

            // --- GRAND TOTAL ---
            document.add(new Paragraph(" "));
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph totalPara = new Paragraph("GRAND TOTAL: $" + String.format("%.2f", grandTotal), totalFont);
            totalPara.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalPara);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void addHeader(PdfPTable table, String text) {
        PdfPCell header = new PdfPCell();
        header.setPhrase(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        header.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(header);
    }

    // You need to add this import at the top of the file:
    // import java.time.format.DateTimeFormatter;

    public byte[] generateZipBundle(LocalDate startDate, LocalDate endDate) {
        // 1. Get Invoices
        List<Invoice> invoices = invoiceRepository.findByDateBetween(startDate, endDate);

        // 2. Generate the PDF Report first
        byte[] pdfReport = generateWeeklyReport(startDate, endDate);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            // 3. Add the PDF Summary Report
            ZipEntry reportEntry = new ZipEntry("Weekly_Summary_Report.pdf");
            zos.putNextEntry(reportEntry);
            zos.write(pdfReport);
            zos.closeEntry();

            // Create Date Formatter (dd-MonthName-yyyy)
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MMMM-yyyy");

            // 4. Add each Original Invoice PDF
            for (Invoice invoice : invoices) {
                if (invoice.getFileUrl() != null) {
                    try {
                        Path filePath = Paths.get("uploads").resolve(invoice.getFileUrl());
                        
                        if (Files.exists(filePath)) {
                            // --- NEW NAMING LOGIC ---
                            // 1. Vendor (Sanitized)
                            String safeVendor = invoice.getVendor().replaceAll("[^a-zA-Z0-9 ]", "").trim();
                            
                            // 2. Date (Formatted as 15-December-2025)
                            String dateStr = (invoice.getDate() != null) ? invoice.getDate().format(dateFormatter) : "NoDate";
                            
                            // 3. Invoice Number
                            String safeInvNum = (invoice.getInvoiceNumber() != null) ? invoice.getInvoiceNumber() : String.valueOf(invoice.getId());

                            // Combine: "Costco 15-December-2025 #INV123.pdf"
                            String niceFileName = safeVendor + " " + dateStr + " #" + safeInvNum + ".pdf";
                            // ------------------------
                            
                            ZipEntry invoiceEntry = new ZipEntry("Proofs/" + niceFileName);
                            zos.putNextEntry(invoiceEntry);
                            Files.copy(filePath, zos);
                            zos.closeEntry();
                        }
                    } catch (Exception e) {
                        System.err.println("Could not add file to zip: " + invoice.getFileUrl());
                    }
                }
            }

            zos.finish();
            return baos.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}