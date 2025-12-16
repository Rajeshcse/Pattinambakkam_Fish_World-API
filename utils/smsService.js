import axios from 'axios';

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'FAST2SMS';

const sendSMS_Fast2SMS = async (phone, otp) => {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        sender_id: process.env.FAST2SMS_SENDER_ID || 'FSHTXT',
        message: process.env.FAST2SMS_TEMPLATE_ID || '',
        variables_values: otp,
        flash: 0,
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: response.data.return === true,
      messageId: response.data.message_id,
      response: response.data,
    };
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

const sendSMS_MSG91 = async (phone, otp) => {
  try {
    const response = await axios.post(
      `https://control.msg91.com/api/v5/otp`,
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${phone}`,
        authkey: process.env.MSG91_AUTH_KEY,
        otp: otp,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          authkey: process.env.MSG91_AUTH_KEY,
        },
      }
    );

    return {
      success: response.data.type === 'success',
      messageId: response.data.request_id,
      response: response.data,
    };
  } catch (error) {
    console.error('MSG91 Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

const sendSMS_Twilio = async (phone, otp) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        To: `+91${phone}`,
        From: fromNumber,
        Body: `Your Pattinambakkam Fish World verification OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`,
      }),
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.sid,
      response: response.data,
    };
  } catch (error) {
    console.error('Twilio Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

const sendSMS_Console = async (phone, otp) => {
  console.log('\n' + '='.repeat(60));
  console.log('📱 SMS SERVICE - CONSOLE MODE (Development)');
  console.log('='.repeat(60));
  console.log(`📞 Phone: +91${phone}`);
  console.log(`🔐 OTP: ${otp}`);
  console.log(`📄 Message: Your Pattinambakkam Fish World verification OTP is: ${otp}`);
  console.log(`⏱️  Valid for: 10 minutes`);
  console.log('='.repeat(60) + '\n');

  return {
    success: true,
    messageId: `console-${Date.now()}`,
    response: { mode: 'console', otp, phone },
  };
};

export const sendVerificationSMS = async (phone, otp, name = '') => {
  try {
    console.log(`Sending OTP ${otp} to phone ${phone} using ${SMS_PROVIDER}`);

    if (process.env.NODE_ENV === 'development' && !process.env.SMS_PROVIDER) {
      return await sendSMS_Console(phone, otp);
    }

    let result;
    switch (SMS_PROVIDER.toUpperCase()) {
      case 'FAST2SMS':
        result = await sendSMS_Fast2SMS(phone, otp);
        break;
      case 'MSG91':
        result = await sendSMS_MSG91(phone, otp);
        break;
      case 'TWILIO':
        result = await sendSMS_Twilio(phone, otp);
        break;
      case 'CONSOLE':
        result = await sendSMS_Console(phone, otp);
        break;
      default:
        console.warn(`Unknown SMS provider: ${SMS_PROVIDER}, falling back to console`);
        result = await sendSMS_Console(phone, otp);
    }

    if (result.success) {
      console.log(`✅ OTP sent successfully to ${phone} via ${SMS_PROVIDER}`);
    } else {
      console.error(`❌ Failed to send OTP to ${phone} via ${SMS_PROVIDER}:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('Send verification SMS error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const sendWelcomeSMS = async (phone, name) => {
  try {
    const message = `Welcome to Pattinambakkam Fish World, ${name}! 🐟 Your account is now verified. Order fresh fish delivered in 2 hours across Chennai. Happy shopping!`;

    if (process.env.NODE_ENV === 'development' || SMS_PROVIDER === 'CONSOLE') {
      console.log('\n' + '='.repeat(60));
      console.log('📱 WELCOME SMS - CONSOLE MODE');
      console.log('='.repeat(60));
      console.log(`📞 Phone: +91${phone}`);
      console.log(`👤 Name: ${name}`);
      console.log(`📄 Message: ${message}`);
      console.log('='.repeat(60) + '\n');

      return { success: true, messageId: `welcome-${Date.now()}` };
    }

    let result;
    switch (SMS_PROVIDER.toUpperCase()) {
      case 'FAST2SMS':
        result = await axios.post(
          'https://www.fast2sms.com/dev/bulkV2',
          {
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: phone,
          },
          {
            headers: {
              authorization: process.env.FAST2SMS_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        return { success: result.data.return === true, messageId: result.data.message_id };

      case 'MSG91':
        result = await axios.post(
          'https://control.msg91.com/api/v5/flow/',
          {
            template_id: process.env.MSG91_WELCOME_TEMPLATE_ID,
            short_url: '0',
            recipients: [
              {
                mobiles: `91${phone}`,
                var1: name,
              },
            ],
          },
          {
            headers: {
              authkey: process.env.MSG91_AUTH_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        return { success: result.data.type === 'success', messageId: result.data.request_id };

      case 'TWILIO':
        result = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          new URLSearchParams({
            To: `+91${phone}`,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: message,
          }),
          {
            auth: {
              username: process.env.TWILIO_ACCOUNT_SID,
              password: process.env.TWILIO_AUTH_TOKEN,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return { success: true, messageId: result.data.sid };

      default:
        return { success: true, messageId: `console-welcome-${Date.now()}` };
    }
  } catch (error) {
    console.error('Send welcome SMS error:', error);
    return { success: false, error: error.message };
  }
};
