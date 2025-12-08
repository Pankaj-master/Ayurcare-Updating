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

// ------------------------------------------------------------
// 1️⃣ TEMP PASSWORD EMAIL
// ------------------------------------------------------------
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
    `,
  });
};

// ------------------------------------------------------------
// 2️⃣ DOCTOR APPROVED EMAIL
// ------------------------------------------------------------
export const sendDoctorVerificationMail = async (
  to: string,
  name: string
) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Your Ayurcare Doctor Account Has Been Verified",
    html: `
      <h2>Congratulations Dr. ${name},</h2>
      <p>Your account has been <strong style="color: green;">VERIFIED</strong> by the Ayurcare Super Admin.</p>
      <p>You now have full access to doctor features including:</p>
      <ul>
        <li>Patient Management</li>
        <li>Diet Plan Creation</li>
        <li>Chat & Consultations</li>
      </ul>
      <p>Thank you for being part of Ayurcare.</p>
    `,
  });
};

// ------------------------------------------------------------
// 3️⃣ DOCTOR REJECTED EMAIL
// ------------------------------------------------------------
export const sendDoctorRejectionMail = async (
  to: string,
  name: string,
  reason?: string
) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "Your Ayurcare Doctor Verification Request",
    html: `
      <h2>Hello Dr. ${name},</h2>
      <p>Your verification request has been 
        <strong style="color: red;">REJECTED</strong> by the Ayurcare Super Admin.</p>
      <p><strong>Reason:</strong> ${reason || "No reason provided."}</p>

      <p>If this seems incorrect or you want to resubmit correct details, 
      please contact support or update your profile.</p>

      <p>Thank you.</p>
    `,
  });
};