package com.pivik.finance_dashboard.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;

@Service // Utility worker to help expract the information from the PDF
public class PdfExtractionService {

    public String extractText(String filePath) {
        try {
            // 1. Load the file from the hard drive
            File file = new File(filePath);
            
            // 2. Open the PDF document
            PDDocument document = PDDocument.load(file);
            
            // 3. Create the "Stripper" (The tool that pulls text out)
            PDFTextStripper stripper = new PDFTextStripper();
            
            // 4. Run the stripper on the document to get the text
            String text = stripper.getText(document);
            
            // 5. Close document to free ups space
            document.close();
            
            return text;

        } catch (IOException e) {
            e.printStackTrace();
            return "Error: Could not read PDF.";
        }
    }
}