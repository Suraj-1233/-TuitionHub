package com.tuitionhub.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.cache.annotation.Cacheable;

import java.util.Map;

@Service
@Slf4j
public class CurrencyService {

    private static final String API_URL = "https://api.exchangerate-api.com/v4/latest/INR";
    private final RestTemplate restTemplate = new RestTemplate();

    @Cacheable("exchangeRates")
    public double getExchangeRate(String targetCurrency) {
        if ("INR".equalsIgnoreCase(targetCurrency)) {
            return 1.0;
        }
        try {
            log.info("🌐 Fetching latest exchange rates for INR...");
            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);
            if (response != null && response.containsKey("rates")) {
                Map<String, Double> rates = (Map<String, Double>) response.get("rates");
                return rates.getOrDefault(targetCurrency.toUpperCase(), 1.0);
            }
        } catch (Exception e) {
            log.error("❌ Failed to fetch exchange rates: {}", e.getMessage());
        }
        // Fallback rates if API fails
        return getFallbackRate(targetCurrency);
    }

    private double getFallbackRate(String currency) {
        switch (currency.toUpperCase()) {
            case "USD": return 0.012;
            case "EUR": return 0.011;
            case "GBP": return 0.0094;
            default: return 1.0;
        }
    }

    public double convert(double amountInInr, String targetCurrency) {
        double rate = getExchangeRate(targetCurrency);
        return amountInInr * rate;
    }
}
