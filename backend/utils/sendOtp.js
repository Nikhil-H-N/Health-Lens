const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (email, otp) => {
  await transporter.sendMail({
    from: `"Health Lens" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Health Lens OTP",
    html: `<h3>Your OTP is: <b>${otp}</b></h3><p>Valid for 5 minutes</p>`
  });
};
