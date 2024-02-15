import 'dotenv/config';
import nodemailer from 'nodemailer';

export async function sendEmailWithAttachment(filePath) {
  const mailTransport = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY
    }
  })
  
  let mailOptions = {
    from: process.env.FROM,
    to: process.env.TO,
    cc: process.env.CC,
    subject: 'Fidgetech offline links/images',
    text: 'See attached file for a best guess list of broken links and images.',
    attachments: [{path: filePath}]
  };

  try {
    await mailTransport.sendMail(mailOptions);
    console.log('Email sent.');
  } catch(error) {
    console.error('There was an error while sending the email:', error);
  }
}
