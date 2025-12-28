package com.pivik.finance_dashboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
            // 1. Prepare the Prompt (Clearer structure)
            String prompt = "Analyze this invoice text and return a JSON object with these exact fields: " +
                            "vendor (string), invoiceNumber (string), amount (number), date (YYYY-MM-DD), category (string). " +
                            "Rules:\n" +
                            "1. Vendor: Standardize to main brand (e.g., 'Whse 802' -> 'Costco').\n" +
                            "2. Category: Choose one: [Groceries, Equipment, Services, Utilities, Other].\n" +
                            "3. Return ONLY valid JSON. No markdown.\n\n" +
                            "INVOICE TEXT:\n" + invoiceText;

            // 2. Build the JSON Request safely using Jackson (No more manual string hacking!)
            ObjectNode requestJson = objectMapper.createObjectNode();
            requestJson.put("model", model);
            requestJson.put("temperature", 0.3);

            ArrayNode messages = requestJson.putArray("messages");
            
            // System Message
            ObjectNode systemMessage = messages.addObject();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are a financial assistant. Return only raw JSON.");

            // User Message
            ObjectNode userMessage = messages.addObject();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);

            String requestBody = objectMapper.writeValueAsString(requestJson);

            // 3. Send Request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Print what OpenAI actually said!
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("OpenAI Raw Response: " + response.body());

            if (response.statusCode() != 200) {
                return null; // Stop if API failed
            }

            // 4. Parse Response
            return extractContentFromOpenAiResponse(response.body());

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private String extractContentFromOpenAiResponse(String rawResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            // Dig down to the content
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            // Clean markdown if AI added it
            return content.replace("```json", "").replace("```", "").trim();
        } catch (Exception e) {
            System.out.println("Error extracting content: " + e.getMessage());
            return "{}";
        }
    }
}