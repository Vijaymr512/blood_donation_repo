/**
 * Geocodes an address using OpenStreetMap Nominatim API
 * @param {String} address The address to geocode
 * @returns {Promise<{lat: Number, lng: Number} | null>}
 */
const geocodeAddress = async (address) => {
  if (!address || address.trim() === '' || address.toLowerCase() === 'unknown') {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BloodDonationApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null; // Fail gracefully
  }
};

module.exports = { geocodeAddress };
