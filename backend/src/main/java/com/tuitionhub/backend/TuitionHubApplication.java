package com.tuitionhub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TuitionHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(TuitionHubApplication.class, args);
    }
}
