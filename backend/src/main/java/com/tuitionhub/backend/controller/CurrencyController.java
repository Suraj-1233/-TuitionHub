package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/currency")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CurrencyController {

    private final CurrencyService currencyService;

    @GetMapping("/rate/{target}")
    public Map<String, Double> getRate(@PathVariable String target) {
        return Map.of("rate", currencyService.getExchangeRate(target));
    }

    @GetMapping("/convert")
    public Map<String, Double> convert(@RequestParam double amount, @RequestParam String target) {
        return Map.of("convertedAmount", currencyService.convert(amount, target));
    }
}
