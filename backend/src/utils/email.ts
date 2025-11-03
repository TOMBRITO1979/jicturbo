import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'CRM Chatwoot <crmchatwoot@gmail.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Recuperação de Senha - CrWell</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 20px;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 36px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .header-subtitle {
          color: #dcfce7;
          font-size: 14px;
          font-weight: 500;
        }
        .content {
          padding: 40px 30px;
        }
        .icon-container {
          text-align: center;
          margin-bottom: 24px;
        }
        .icon {
          width: 64px;
          height: 64px;
          background: #f0fdf4;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        h1 {
          font-size: 24px;
          color: #1a1a1a;
          margin-bottom: 16px;
          text-align: center;
          font-weight: 700;
        }
        p {
          color: #525252;
          margin-bottom: 16px;
          font-size: 15px;
          line-height: 1.7;
        }
        .highlight {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .highlight p {
          margin: 0;
          color: #78350f;
          font-size: 14px;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          padding: 16px 48px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
          transition: all 0.3s ease;
        }
        .button:hover {
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
          transform: translateY(-2px);
        }
        .link-box {
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
          text-align: center;
        }
        .link-box p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          word-break: break-all;
        }
        .divider {
          border: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 32px 0;
        }
        .security-note {
          background: #f0f9ff;
          border-left: 4px solid #0284c7;
          padding: 16px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .security-note p {
          margin: 0;
          color: #075985;
          font-size: 14px;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #6b7280;
          font-size: 13px;
          margin: 8px 0;
        }
        .footer-logo {
          color: #16a34a;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .social-links {
          margin-top: 16px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #9ca3af;
          text-decoration: none;
          font-size: 12px;
        }
        @media only screen and (max-width: 600px) {
          body { padding: 10px; }
          .email-wrapper { border-radius: 12px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .logo { font-size: 28px; }
          h1 { font-size: 20px; }
          .button { padding: 14px 32px; font-size: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
          <div class="logo">CrWell</div>
          <div class="header-subtitle">Sistema de Gestão de Relacionamento com Clientes</div>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Icon -->
          <div class="icon-container">
            <div class="icon">🔐</div>
          </div>

          <!-- Title -->
          <h1>Recuperação de Senha</h1>

          <!-- Message -->
          <p>Olá,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta CrWell. Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>

          <!-- CTA Button -->
          <div class="button-container">
            <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
          </div>

          <!-- Warning -->
          <div class="highlight">
            <p><strong>⏱️ Atenção:</strong> Este link é válido por apenas <strong>1 hora</strong> por motivos de segurança.</p>
          </div>

          <!-- Divider -->
          <hr class="divider">

          <!-- Alternative Link -->
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 12px;">
            Se o botão não funcionar, copie e cole este link no seu navegador:
          </p>
          <div class="link-box">
            <p>${resetUrl}</p>
          </div>

          <!-- Security Note -->
          <div class="security-note">
            <p><strong>🛡️ Dica de Segurança:</strong> Se você não solicitou esta recuperação de senha, ignore este e-mail. Sua senha permanecerá segura e inalterada.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">CrWell</div>
          <p>Gestão inteligente de relacionamento com clientes</p>
          <p style="margin-top: 16px;">
            Este é um e-mail automático, por favor não responda.<br>
            Se precisar de ajuda, entre em contato com o suporte.
          </p>
          <div class="social-links">
            <a href="https://app.crwell.pro">Portal</a> •
            <a href="https://api.crwell.pro">API</a>
          </div>
          <p style="margin-top: 16px; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} CrWell. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Recuperação de Senha - CrWell',
    html,
  });
};
