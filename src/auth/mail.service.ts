import * as nodemailer from 'nodemailer';

export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    //const link = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}`;
    const link = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Schedula" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h3>Email Verification</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${link}">${link}</a>
      `,
    });
  }
}
