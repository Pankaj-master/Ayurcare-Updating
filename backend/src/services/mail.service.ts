import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // for TLS (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendTempPasswordMail = async (to: string, tempPassword: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Your Ayurcare Temporary Password",
    html: `
      <h3>Welcome to Ayurcare!</h3>
      <p>Your temporary password is:</p>
      <h2>${tempPassword}</h2>
      <p>Please log in and change your password immediately.</p>
    `
  });
};
