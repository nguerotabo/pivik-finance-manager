package com.pivik.finance_dashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper(); 

    public String extractInvoiceDetails(String invoiceText) {
        try {
            // 1. Prepare the Prompt
            String prompt = "Analyze this invoice text and return a JSON object with these exact fields: " +
                            "vendor (string), amount (number), date (YYYY-MM-DD), category (string). " +
                            "Return ONLY valid JSON. No markdown formatting. Text: " + 
                            invoiceText.replace("\"", "'").replace("\n", " ");

            String requestBody = """
                {
                    "model": "%s",
                    "messages": [
                        {"role": "system", "content": "You are a financial assistant. Return only raw JSON."},
                        {"role": "user", "content": "%s"}
                    ],
                    "temperature": 0.3
                }
                """.formatted(model, prompt);

            // 2. Send Request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // 3. Parse the Response to get the important info
            return extractContentFromOpenAiResponse(response.body());

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // Helper method to get the important info from OpenAI response
    private String extractContentFromOpenAiResponse(String rawResponse) {
        try {
            // Convert string to JSON tree
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            // Clean up the JSON
            content = content.replace("```json", "").replace("```", "").trim();
            
            return content; // Now we just have clean JSON: { "vendor": "Costco", ... }
        } catch (Exception e) {
            return "{}"; // Return empty JSON on error
        }
    }
}