const User = require('../models/User');

/**
 * Extracts meaningful location keywords from an address string.
 * e.g., "abc Hospital, Jalahalli, Bengaluru" => ["abc hospital", "jalahalli", "bengaluru"]
 */
const extractLocationKeywords = (address) => {
  if (!address) return [];
  return address
    .toLowerCase()
    .split(/[,\s\/\-]+/) // Split by commas, spaces, slashes, hyphens
    .map(w => w.trim())
    .filter(w => w.length > 2) // Remove very short words like "in", "at", "of"
    .filter(w => !['hospital', 'road', 'street', 'lane', 'nagar', 'cross', 'main', 'block'].includes(w)); // Strip generic place words
};

/**
 * Checks if there is any keyword overlap between two location strings.
 */
const locationsOverlap = (address1, address2) => {
  const keywords1 = extractLocationKeywords(address1);
  const keywords2 = extractLocationKeywords(address2);
  if (!keywords1.length || !keywords2.length) return false;
  return keywords1.some(kw => keywords2.includes(kw));
};

/**
 * Matches donors based on blood group AND location keyword matching.
 * @param {Object} requestData The validated AI extracted data
 * @returns {Promise<Array>} Array of matched user objects
 */
const matchDonors = async (requestData) => {
  try {
    const { blood_group, hospital_address } = requestData;

    if (!hospital_address) {
      console.warn('Donor Matching: No hospital address provided, skipping location filter.');
      return [];
    }

    console.log(`\n🔍 Matching donors for: Blood Group=${blood_group}, Location="${hospital_address}"`);
    console.log(`   Location Keywords: [${extractLocationKeywords(hospital_address).join(', ')}]`);

    // Fetch all registered donors
    const allDonors = await User.find({ isRegistered: true });
    console.log(`   Total registered donors: ${allDonors.length}`);

    // Filter by blood group (if specified) and location keyword match
    const matchedDonors = allDonors.filter(user => {
      // 1. Blood group match — if blood_group is provided, it must match
      const bloodGroupMatch = blood_group && blood_group !== 'Unknown'
        ? user.bloodGroup === blood_group
        : true; // No blood group filter if unknown

      // 2. Location match — check if any keyword from hospital address matches user's location
      const locationMatch = locationsOverlap(hospital_address, user.location);

      return bloodGroupMatch && locationMatch;
    });

    console.log(`   ✅ Matched ${matchedDonors.length} donor(s) in the area.`);
    if (matchedDonors.length > 0) {
      matchedDonors.forEach(d => console.log(`     - ${d.name} (${d.bloodGroup}) @ ${d.location} | Phone: ${d.contactInfo}`));
    }

    return matchedDonors;
  } catch (error) {
    console.error('Donor Matching Error:', error.message);
    throw new Error('Failed to match donors');
  }
};

module.exports = { matchDonors };
