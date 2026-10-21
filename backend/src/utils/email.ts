import nodemailer from 'nodemailer';

// Mock/Ethereal mail setup for dev
let transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'test@ethereal.email', // This would be replaced with real creds in prod
    pass: 'test',
  }
});

export const sendCredentialsEmail = async (toEmail: string, name: string, password: string): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: '"Admin Police Portal" <noreply@smartcrimemapping.com>',
      to: toEmail,
      subject: 'Your Account Has Been Approved - Login Credentials',
      text: `Hello ${name},\n\nYour request for access has been approved.\n\nYour login credentials are:\nEmail: ${toEmail}\nPassword: ${password}\n\nPlease login and change your password immediately.\n\nRegards,\nAdmin`,
      html: `
        <h3>Hello ${name},</h3>
        <p>Your request for access to the Police Data Portal has been <b>approved</b>.</p>
        <p>Your login credentials are:</p>
        <ul>
          <li><b>Email:</b> ${toEmail}</li>
          <li><b>Password:</b> ${password}</li>
        </ul>
        <p>Please login and change your password immediately.</p>
        <br/>
        <p>Regards,<br/>Admin<br/><i>This is a non-reply mail.</i></p>
      `
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
