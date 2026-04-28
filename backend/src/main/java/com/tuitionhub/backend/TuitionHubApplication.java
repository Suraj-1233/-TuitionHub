package com.tuitionhub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class TuitionHubApplication {
    public static void main(String[] args) {
        // Try to load from current directory first, then parent
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        if (dotenv.get("MAIL_USERNAME") == null) {
            dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();
        }
        
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
        
        String mailUser = System.getProperty("MAIL_USERNAME") != null ? System.getProperty("MAIL_USERNAME") : System.getenv("MAIL_USERNAME");
        System.out.println("📬 Mail Config Check: " + mailUser);
        SpringApplication.run(TuitionHubApplication.class, args);
    }
}
