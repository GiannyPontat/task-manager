package com.taskmanager.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${application.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@taskboard.local}")
    private String fromAddress;

    public void sendInvitationEmail(String toEmail, String inviterName, String taskTitle, String token) {
        String registerLink = frontendUrl + "/register?email=" + toEmail + "&inviteToken=" + token;
        String taskLine = (taskTitle != null)
                ? "<p style=\"color:#64748b;font-size:0.9rem\">Tâche concernée : <strong>" + taskTitle + "</strong></p>"
                : "";
        String html = """
            <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
              <div style="background:linear-gradient(135deg,#6366f1,#3b82f6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <h1 style="color:#fff;margin:0;font-size:1.4rem">✓ TaskBoard</h1>
              </div>
              <h2 style="color:#0f172a;font-size:1.1rem;margin-bottom:8px">Vous avez été invité !</h2>
              <p style="color:#64748b;font-size:0.9rem;line-height:1.6">
                <strong>%s</strong> vous invite à collaborer sur TaskBoard.
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

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(inviterName + " vous invite à rejoindre TaskBoard");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            // Simulation console si l'email n'est pas configuré
            System.out.printf("[INVITATION EMAIL] To: %s | Link: %s%n", toEmail, registerLink);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Réinitialisation de votre mot de passe – TaskBoard");

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String html = """
                <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
                  <div style="background:linear-gradient(135deg,#6366f1,#3b82f6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                    <h1 style="color:#fff;margin:0;font-size:1.4rem">🔒 TaskBoard</h1>
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

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }
}
