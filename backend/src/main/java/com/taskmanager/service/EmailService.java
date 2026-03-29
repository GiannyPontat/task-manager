package com.taskmanager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${resend.api-key:}")
    private String apiKey;

    @Value("${resend.from:Flowly <onboarding@resend.dev>}")
    private String fromAddress;

    @Value("${application.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    public void sendInvitationEmail(String toEmail, String inviterName, String taskTitle, String token) {
        String registerLink = frontendUrl + "/register?email=" + toEmail + "&inviteToken=" + token;
        String taskLine = (taskTitle != null)
                ? "<p style=\"color:#64748b;font-size:0.9rem\">Tâche concernée : <strong>" + taskTitle + "</strong></p>"
                : "";
        String html = """
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
              <div style="background:linear-gradient(135deg,#6366f1,#3b82f6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">✓ Flowly</h1>
              </div>
              <h2 style="color:#0f172a;font-size:1.1rem;margin-bottom:8px">Vous avez été invité !</h2>
              <p style="color:#64748b;font-size:0.9rem;line-height:1.6">
                <strong>%s</strong> vous invite à collaborer sur Flowly.
              </p>
              %s
              <div style="text-align:center;margin:28px 0">
                <a href="%s" style="background:linear-gradient(135deg,#6366f1,#3b82f6);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.95rem">
                  Créer mon compte
                </a>
              </div>
              <p style="color:#94a3b8;font-size:0.78rem;text-align:center">
                Si vous n'attendiez pas cette invitation, ignorez cet email.
              </p>
            </div>
            """.formatted(inviterName, taskLine, registerLink);

        send(toEmail, inviterName + " vous invite à rejoindre Flowly", html, registerLink);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String html = """
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
              <div style="background:linear-gradient(135deg,#6366f1,#3b82f6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">🔒 Flowly</h1>
              </div>
              <h2 style="color:#0f172a;font-size:1.1rem;margin-bottom:8px">Réinitialisation du mot de passe</h2>
              <p style="color:#64748b;font-size:0.9rem;line-height:1.6">
                Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.
                Ce lien est valable <strong>1 heure</strong>.
              </p>
              <div style="text-align:center;margin:28px 0">
                <a href="%s" style="background:linear-gradient(135deg,#6366f1,#3b82f6);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.95rem">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color:#94a3b8;font-size:0.78rem;text-align:center">
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
              </p>
            </div>
            """.formatted(resetLink);

        try {
            send(toEmail, "Réinitialisation de votre mot de passe – Flowly", html, resetLink);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }

    private void send(String toEmail, String subject, String html, String fallbackLink) {
        if (apiKey == null || apiKey.isBlank()) {
            System.out.printf("[EMAIL - no API key] To: %s | Link: %s%n", toEmail, fallbackLink);
            return;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
                "from", fromAddress,
                "to", List.of(toEmail),
                "subject", subject,
                "html", html
        );

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.resend.com/emails",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );
            System.out.printf("[EMAIL SENT] To: %s | Status: %s%n", toEmail, response.getStatusCode());
        } catch (Exception e) {
            System.out.printf("[EMAIL FAILED] To: %s | Error: %s%n", toEmail, e.getMessage());
        }
    }
}
