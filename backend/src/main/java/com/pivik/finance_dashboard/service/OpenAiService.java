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

            // 3. NEW: Parse the Response to get ONLY the 'content'
            return extractContentFromOpenAiResponse(response.body());

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // Helper method to dig through the big OpenAI response
    private String extractContentFromOpenAiResponse(String rawResponse) {
        try {
            // Convert String -> JSON Tree
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            
            // Dig down: choices -> [0] -> message -> content
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            // Clean up: Remove markdown code blocks (```json ... ```)
            content = content.replace("```json", "").replace("```", "").trim();
            
            return content; // Now we just have clean JSON: { "vendor": "Costco", ... }
        } catch (Exception e) {
            return "{}"; // Return empty JSON on error
        }
    }
}