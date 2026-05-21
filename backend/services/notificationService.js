const Notification = require('../models/Notification');

// ============================================================
//  MOCK SMS SERVICE
//  Replace the sendMockSMS function body with a real Twilio
//  integration when you have API credentials.
// ============================================================
const sendMockSMS = (phoneNumber, message) => {
  const border = '═'.repeat(60);
  console.log(`\n📱 MOCK SMS SENT`);
  console.log(`  ${border}`);
  console.log(`  TO      : ${phoneNumber}`);
  console.log(`  MESSAGE : ${message}`);
  console.log(`  ${border}\n`);
};

/**
 * Generates in-app notifications and sends SMS to each matched donor.
 * @param {Array} matchedDonors - Array of User objects
 * @param {Object} bloodRequest - The saved BloodRequest document
 * @returns {Promise<Number>} - Number of notifications sent
 */
const generateNotifications = async (matchedDonors, bloodRequest) => {
  if (!matchedDonors || matchedDonors.length === 0) {
    console.log('   ⚠️  No matched donors found, no notifications sent.');
    return 0;
  }

  try {
    const isUrgent =
      bloodRequest.priority?.toLowerCase() === 'emergency' ||
      bloodRequest.priority?.toLowerCase() === 'high';

    const urgencyPrefix = isUrgent ? '🚨 URGENT: ' : '';

    const appMessage = `${urgencyPrefix}${bloodRequest.unitsRequired} unit(s) of ${bloodRequest.bloodGroupRequired} blood needed at ${bloodRequest.hospitalName}, ${bloodRequest.hospitalAddress}. Please respond immediately.`;

    const smsMessage = `${urgencyPrefix}Blood Needed! ${bloodRequest.unitsRequired} unit(s) of ${bloodRequest.bloodGroupRequired} required at ${bloodRequest.hospitalName}, ${bloodRequest.hospitalAddress}. Open the Blood Donation App to accept this request.`;

    // 1. Save in-app notifications to MongoDB in bulk
    const notifications = matchedDonors.map(donor => ({
      userId: donor._id,
      requestId: bloodRequest._id,
      message: appMessage
    }));
    await Notification.insertMany(notifications);
    console.log(`\n🔔 In-app notifications saved for ${notifications.length} donor(s).`);

    // 2. Send Mock SMS to each donor
    for (const donor of matchedDonors) {
      if (donor.contactInfo) {
        sendMockSMS(donor.contactInfo, smsMessage);
      } else {
        console.warn(`   ⚠️  Donor "${donor.name}" has no contactInfo, skipping SMS.`);
      }
    }

    return notifications.length;
  } catch (error) {
    console.error('Notification Generation Error:', error.message);
    return 0; // Fail gracefully — don't break the main upload flow
  }
};

module.exports = { generateNotifications };
