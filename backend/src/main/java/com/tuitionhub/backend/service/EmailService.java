package com.tuitionhub.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("📧 Simple email sent to {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send simple email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("📧 HTML email sent to {}", to);
        } catch (MessagingException e) {
            log.error("❌ Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    public void sendPaymentConfirmation(com.tuitionhub.backend.model.Payment payment) {
        String to = payment.getStudent().getEmail();
        if (to == null || to.isEmpty()) return;

        String batchName = payment.getBatch() != null ? payment.getBatch().getName() : "Direct Payment";
        String subject = "Payment Confirmation - " + batchName;
        
        String monthStr = payment.getForMonth() != null 
            ? payment.getForMonth().format(java.time.format.DateTimeFormatter.ofPattern("MMMM yyyy")) 
            : "N/A";

        String htmlContent = String.format(
                """
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #4CAF50;">Payment Successful!</h2>
                        <p>Hello <strong>%s</strong>,</p>
                        <p>Your payment for <strong>%s</strong> has been received successfully.</p>
                        <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">%s %s</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>For Month:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">%s</td>
                            </tr>
                        </table>
                        <p>Thank you for choosing TuitionHub.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #777;">This is an automated email. Please do not reply.</p>
                    </div>
                </body>
                </html>
                """,
                payment.getStudent().getName(),
                batchName,
                payment.getCurrency(),
                payment.getAmount(),
                monthStr,
                payment.getRazorpayPaymentId());

        sendHtmlEmail(to, subject, htmlContent);
    }
}
