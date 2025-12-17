import axios from 'axios';

const sendSMS_Fast2SMS = async (phone, otp) => {
  try {
    const params = new URLSearchParams({
      authorization: process.env.FAST2SMS_API_KEY,
      route: 'otp',
      variables_values: otp,
      flash: '0',
      numbers: phone
    });

    const url = `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`;

    console.log(
      '[Fast2SMS] Sending OTP request to:',
      url.replace(process.env.FAST2SMS_API_KEY, 'API_KEY_HIDDEN')
    );

    const response = await axios.get(url);

    console.log('[Fast2SMS] Response:', response.data);

    return {
      success: response.data.return === true,
      messageId: response.data.message_id,
      response: response.data
    };
  } catch (error) {
    console.error('Fast2SMS Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
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
        otp: otp
      },
      {
        headers: {
          'Content-Type': 'application/json',
          authkey: process.env.MSG91_AUTH_KEY
        }
      }
    );

    return {
      success: response.data.type === 'success',
      messageId: response.data.request_id,
      response: response.data
    };
  } catch (error) {
    console.error('MSG91 Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
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
        Body: `Your Pattinambakkam Fish World verification OTP is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.sid,
      response: response.data
    };
  } catch (error) {
    console.error('Twilio Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

const sendSMS_2Factor = async (phone, otp) => {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;
    const templateName = process.env.TWOFACTOR_TEMPLATE_NAME?.trim();

    // Default manual OTP endpoint -> `.../SMS/:phone/:otp`
    // If a DLT-approved template name is configured, append it to force SMS delivery
    const baseUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}`;
    const url = templateName
      ? `${baseUrl}/${encodeURIComponent(templateName)}`
      : baseUrl;

    console.log('[2Factor] ========================================');
    console.log('[2Factor] Sending OTP via Dedicated OTP API');
    console.log('[2Factor] Phone:', phone);
    console.log('[2Factor] OTP:', otp);
    console.log('[2Factor] Template:', templateName || 'Default 2Factor OTP template');
    console.log('[2Factor] API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    console.log('[2Factor] Note: Using V1 SMS endpoint to force SMS (no voice fallback)');
    console.log('[2Factor] ========================================');

    const response = await axios.get(url);

    console.log('[2Factor] Full Response:', JSON.stringify(response.data, null, 2));
    console.log('[2Factor] Status:', response.data.Status);
    console.log('[2Factor] Details:', response.data.Details);

    // 2Factor.in returns { Status: "Success", Details: "message_id" } on success
    const isSuccess = response.data.Status === 'Success';

    if (isSuccess) {
      console.log('[2Factor] ✅ SMS sent successfully! Message ID:', response.data.Details);
      console.log('[2Factor] 📱 OTP SMS should arrive within 1-2 minutes');
    } else {
      console.log('[2Factor] ❌ SMS failed. Response:', response.data);
    }

    return {
      success: isSuccess,
      messageId: response.data.Details,
      response: response.data
    };
  } catch (error) {
    console.error('[2Factor] ❌ Error occurred:');
    console.error('[2Factor] Error message:', error.message);
    console.error('[2Factor] Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.Details || error.message
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
    response: { mode: 'console', otp, phone }
  };
};

export const sendVerificationSMS = async (phone, otp, name = '') => {
  try {
    // Read provider fresh each time - default to CONSOLE for development safety
    const SMS_PROVIDER = process.env.SMS_PROVIDER || 'CONSOLE';

    console.log(`[SMS Service] Sending OTP ${otp} to phone ${phone} using ${SMS_PROVIDER}`);
    console.log(`[SMS Service] NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[SMS Service] SMS_PROVIDER from env: ${process.env.SMS_PROVIDER}`);

    if (process.env.NODE_ENV === 'development' && !process.env.SMS_PROVIDER) {
      console.log('[SMS Service] Using CONSOLE mode (no SMS_PROVIDER set)');
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
      case '2FACTOR':
      case 'TWOFACTOR':
        result = await sendSMS_2Factor(phone, otp);
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
      error: error.message
    };
  }
};

export const sendWelcomeSMS = async (phone, name) => {
  try {
    // Read provider fresh each time - default to CONSOLE for development safety
    const SMS_PROVIDER = process.env.SMS_PROVIDER || 'CONSOLE';

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
        const params = new URLSearchParams({
          authorization: process.env.FAST2SMS_API_KEY,
          route: 'q',
          message: message,
          language: 'english',
          flash: '0',
          numbers: phone
        });
        result = await axios.get(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`);
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
                var1: name
              }
            ]
          },
          {
            headers: {
              authkey: process.env.MSG91_AUTH_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        return { success: result.data.type === 'success', messageId: result.data.request_id };

      case '2FACTOR':
      case 'TWOFACTOR':
        // 2Factor.in transactional SMS API
        const apiKey = process.env.TWOFACTOR_API_KEY;
        const encodedMessage = encodeURIComponent(message);
        const twoFactorUrl = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`;
        const twoFactorParams = new URLSearchParams({
          From: 'FSHWLD',
          To: phone,
          Msg: message
        });
        result = await axios.post(twoFactorUrl, twoFactorParams, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return { success: result.data.Status === 'Success', messageId: result.data.Details };

      case 'TWILIO':
        result = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          new URLSearchParams({
            To: `+91${phone}`,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: message
          }),
          {
            auth: {
              username: process.env.TWILIO_ACCOUNT_SID,
              password: process.env.TWILIO_AUTH_TOKEN
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
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
