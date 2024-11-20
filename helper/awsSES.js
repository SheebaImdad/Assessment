const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const constant = require("../config/constant");

AWS.config.update({
  accessKeyId: constant.AWS_CREDENTIALS.ACCESS_KEY_ID,
  secretAccessKey: constant.AWS_CREDENTIALS.SECRET_ACCESS_KEY,
  region: constant.AWS_CREDENTIALS.REGION,
});

const sendMail = async (to, subject, body, temporaryPassword) => {
  const ses = new AWS.SES();
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Data: `
          <html>

          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #1a1a1a; /* Dark background color */
                      color: #ffffff; /* Light text color */
                      padding: 20px;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #333333; /* Dark container background color */
                      padding: 40px;
                      border-radius: 5px;
                      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* Shadow effect */
                  }
                  h1 {
                      color: #ffffff; /* White header text color */
                      font-size: 24px;
                      margin-bottom: 20px;
                  }
                  p {
                      font-size: 16px;
                      margin-bottom: 20px;
                  }
                  .button {
                      display: inline-block;
                      background-color: #007bff; /* Blue button color */
                      color: #ffffff;
                      padding: 10px 20px;
                      border-radius: 5px;
                      text-decoration: none;
                  }
                  /* Additional styles for the button hover effect */
                  .button:hover {
                      background-color: #0056b3; /* Darker blue on hover */
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>${subject}</h1>
                  <p>${body}</p>
                  <p>
                      Please use the following temporary password to log in:
                      <strong>${temporaryPassword}</strong>
                  </p>
                  <p>
                      Note: Please change your password after logging in.
                      <br />
                      <a class="button" href=${"http://15.206.124.114:3040/auth/jwt/officer-login"} target="_blank">Log In</a>
                  </p>
              </div>
          </body>
          </html>
          
                    `,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: constant.EMAIL_SENDER_SOURCENAME,
  };
  try {
    const result = await ses.sendEmail(params).promise();
    return result;
  } catch (e) {
    throw e;
  }
};

let sendForgetPasswordEmail = (userName, mail, url, token) => {
  try {
    const AWS_SES = new AWS.SES();

    let params = {
      Source: `${constant.EMAIL_SENDER_SOURCENAME}`,
      Destination: { ToAddresses: [mail] },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #1a1a1a; /* Dark background color */
                    color: #ffffff; /* Light text color */
                    margin: 0;
                    padding: 0;
                  }
              
                  .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #333333; /* Dark container background color */
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
              
                  h2 {
                    color: #00A76F; /* Green header text color */
                  }
              
                  p {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #ffffff; /* White text color */
                  }
              
                  .reset-button {
                    background-color: #4CAF50; /* Green button color */
                    color: white;
                    padding: 14px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    transition: background-color 0.3s ease;
                    cursor: pointer;
                    display: inline-block;
                  }
              
                  .reset-button:hover {
                    background-color: #45a049; /* Darker green on hover */
                  }
              
                  .footer {
                    margin-top: 20px;
                    text-align: center;
                    color: #888888; /* Lighter text color */
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <p>Hello ${userName},</p>
                  <h2>Reset Your Password</h2>
                  <p>We received a request to reset your password. If you did not initiate this request, you can safely ignore this email.</p>
                  <p>To reset your password, click the button below:</p>
                  <a href="${url}?token=${token}" class="reset-button">Reset Password</a>
                </div>
              
                <div class="footer">
                  <p>Thanks & Regards,</p>
                  <p>${constant.EMAIL_SENDER_SOURCENAME}</p>
                </div>
              </body>
              </html>
              
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Reset your pasword`,
        },
      },
    };
    return AWS_SES.sendEmail(params).promise();
  } catch (e) {
    logger.error("sendForgetPasswordEmail::error", e);
    throw e;
  }
};
module.exports = {
  sendMail,
  sendForgetPasswordEmail,
};
