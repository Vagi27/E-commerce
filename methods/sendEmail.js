
const mailjet = require('node-mailjet').apiConnect(
    "3cfc37fdc1a6c41ad01b9624234d2d78",
    "2e4fa6144ea7b39a646df1b8c3892195",
)
function generateOTP() {

    // Declare a digits variable 
    // which stores all digits
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

module.exports = function (email, callback) {

    console.log("in sendemail module", email);
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: 'ankushfake2673@gmail.com',
                    Name: 'E-comm',
                },
                To: [
                    {
                        Email: email,
                        Name: 'You',
                    },
                ],
                Subject: 'Email verification',
                TextPart: '',
                HTMLPart:
                    `<h1> Your Email verification OTP is:${generateOTP()}</h1>`,
            },
        ],
    })
    request
        .then(result => {
            console.log("Result body");

            console.log(result.body)
            callback(null, result.body)
            return;
        })
        .catch(err => {
            console.log("Error body");
            console.log(err)
        })
};