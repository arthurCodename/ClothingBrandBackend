const nodemailer = require("nodemailer")


const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
           
            service: "gmail",
            
            auth: {
                user: "notarcdefinitelynotarc@gmail.com",
                pass: "aiya hvux gxvi uuca",
            },
        });

        await transporter.sendMail({
            from: "notarcdefinitelynotarc@gmail.com",
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;