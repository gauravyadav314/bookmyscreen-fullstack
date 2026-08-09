import crypto from "crypto";
import { config } from "../../config/config";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

// generate otp
export const generateOTP = () => {
  const otp = crypto.randomInt(1000, 10000);
  return otp;
};

// hash otp
export const hashOTP = (data: string) => {
  if (!config.hashingSecret) {
    throw new Error("Hashing secret is not defined");
  }
  return crypto
    .createHmac("sha256", config.hashingSecret)
    .update(data)
    .digest("hex");
};

// verify otp
export const verifyOTP = (hashedOTP: string, data: string) => {
  const newHashedOTP = hashOTP(data);
  return newHashedOTP === hashedOTP;
};

// send otp to user via email;

const _config = {
  service: "gmail",
  auth: {
    user: config.emailUsername,
    pass: config.emailPassword,
  },
};

const transporter = nodemailer.createTransport(_config);
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "bookMyScreen",
    link: "https://amritraj.vercel.app",
    logo: "https://res.cloudinary.com/amritrajmaurya/image/upload/v1751475322/zu4fnmh2jljzbtey77ah.png",
  },
});



export const sendOTPtoEmail = async (email: string, otp: number) => {
    console.log(`\n========================================`);
    console.log(`🔑 [DEV OTP CODE] Email: ${email} -> OTP: ${otp}`);
    console.log(`========================================\n`);

    const isDummyCredentials = 
        !config.emailUsername || 
        !config.emailPassword || 
        config.emailUsername.includes("dummy") || 
        config.emailPassword.includes("dummy") ||
        config.emailUsername === "your_email@gmail.com";

    if (isDummyCredentials) {
        console.warn("⚠️ Valid email credentials (EMAIL_USERNAME / EMAIL_PASSWORD) are not configured in .env.");
        console.warn("👉 Use the 4-digit OTP printed above in the backend terminal to log in.");

        try {
            const testAccount = await nodemailer.createTestAccount();
            const testTransporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            const emailTemp: any = {
                body: {
                    name: '',
                    intro: "Welcome to bookMyScreen! We're very excited to have you on board.",
                    action: {
                        instructions: 'To verify your account, please use the following OTP:',
                        button: {
                            color: '#323232',
                            text: otp,
                            link: '#'
                        }
                    },
                    outro: 'This OTP will expire in 5 minutes for security reasons.'
                }
            };
            const mail = mailGenerator.generate(emailTemp);
            const info = await testTransporter.sendMail({
                from: '"bookMyScreen" <no-reply@bookmyscreen.com>',
                to: email,
                subject: "Your OTP for bookMyScreen",
                html: mail
            });
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log(`\n📧 [EMAIL TEST INBOX PREVIEW]: View the full email sent to ${email} here:\n👉 ${previewUrl}\n`);
            }
        } catch (e) {
            // ignore test account errors
        }

        return "dev-mode-otp";
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.emailUsername,
                pass: config.emailPassword,
            },
        });

        const emailTemp: any = {
            body: {
                name: '',
                intro: 'Welcome to bookMyScreen! We\'re very excited to have you on board.',
                action: {
                    instructions: 'To verify your account, please use the following OTP:',
                    button: {
                        color: '#323232',
                        text: otp,
                        link: '#'
                    }
                },
                outro: 'This OTP will expire in 2 minutes for security reasons.'
            }
        };

        const mail = mailGenerator.generate(emailTemp);

        let message = {
            from: config.emailUsername,
            to: email,
            subject: "Your OTP for bookMyScreen",
            html: mail
        };

        const info = await transporter.sendMail(message);
        console.log("✅ Email sent successfully to Gmail:", info.messageId);
        return info.messageId;
    } catch (error) {
        console.error("⚠️ Email delivery failed:", error);
        console.warn("👉 You can still log in using the OTP printed above in the terminal!");
        return "dev-mode-otp-fallback";
    }
}