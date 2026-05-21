const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const auth = require('../middlewares/auth');

// Import new services & utils
const { extractTextFromFile } = require('../services/fileProcessingService');
const { extractBloodRequestDetails } = require('../services/aiExtractionService');
const { matchDonors } = require('../services/donorMatchingService');
const { generateNotifications } = require('../services/notificationService');
const { validateAIResponse } = require('../utils/validateAIResponse');
const { geocodeAddress } = require('../utils/geocodeAddress');

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword', 
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'text/plain', 
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// @route   POST api/requests/upload
// @desc    Upload file and extract details via AI
// @access  Public
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, msg: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, msg: 'No file uploaded' });

  try {
    // 1. Extract raw text from file
    const rawText = await extractTextFromFile(req.file);

    // 2. AI Extraction & Zod Validation
    let validatedData;
    let aiRawData = null;
    
    try {
      aiRawData = await extractBloodRequestDetails(rawText);
      validatedData = validateAIResponse(aiRawData);
    } catch (aiError) {
      console.warn("AI Extraction failed, falling back to basic extraction", aiError.message);
      
      // Fallback regex extraction logic
      const bloodGroup = rawText.match(/Blood\s*Group:\s*(.*)/i)?.[1]?.trim() || req.body.bloodGroup || 'O+';
      const unitsStr = rawText.match(/Units:\s*(\d+)/i)?.[1] || req.body.units;
      const hospitalName = rawText.match(/Hospital(?:\s*Name)?:\s*(.*)/i)?.[1]?.trim() || req.body.hospitalName || 'Unknown Hospital';
      const hospitalAddress = rawText.match(/(?:Hospital\s*)?Address:\s*(.*)/i)?.[1]?.trim() || req.body.hospitalAddress || 'Unknown Address';
      
      validatedData = {
        blood_group: bloodGroup,
        units_required: unitsStr ? parseInt(unitsStr, 10) : 1,
        hospital_name: hospitalName,
        hospital_address: hospitalAddress,
        contact_person: req.body.contact || 'Unknown',
        priority: req.body.priority || 'Standard'
      };
    }

    // 3. Geocode Address
    const coordinates = await geocodeAddress(validatedData.hospital_address);

    // 4. Save structured data to MongoDB
    const newRequest = new BloodRequest({
      bloodGroupRequired: validatedData.blood_group || 'O+',
      unitsRequired: validatedData.units_required || 1,
      hospitalName: validatedData.hospital_name || 'Unknown Hospital',
      hospitalAddress: validatedData.hospital_address || 'Unknown Address',
      pointOfContact: validatedData.contact_person || 'Unknown Contact',
      priority: validatedData.priority || 'Standard',
      rawText: rawText,
      aiExtractedData: aiRawData,
      extractedAt: new Date(),
      uploadFileName: req.file.originalname,
      uploadFileType: req.file.mimetype,
      locationCoordinates: coordinates || undefined
    });
    
    await newRequest.save();

    // 5. Match Donors by blood group + location keywords
    const matchedDonors = await matchDonors(validatedData);

    // 6. Generate in-app notifications + Mock SMS
    const notificationsSent = await generateNotifications(matchedDonors, newRequest);

    // 7. API Response
    res.json({ 
      success: true, 
      msg: 'Request processed successfully', 
      extractedData: validatedData,
      request: newRequest,
      matchedDonorsCount: matchedDonors.length,
      notificationsSent
    });

  } catch (err) {
    console.error("Upload Route Error:", err.message);
    res.status(500).json({ success: false, msg: 'Server Error processing document' });
  }
});

// @route   GET api/requests/notifications
// @desc    Get notifications for logged in user
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).populate('requestId').sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/requests/track/:trackingId
// @desc    Track the status of a blood request (Public)
// @access  Public
router.get('/track/:trackingId', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.trackingId);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    
    res.json({
      status: request.status,
      hospitalName: request.hospitalName,
      hospitalAddress: request.hospitalAddress,
      bloodGroupRequired: request.bloodGroupRequired,
      unitsRequired: request.unitsRequired,
      priority: request.priority,
      contactPerson: request.pointOfContact
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Request not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/requests/:id/accept
// @desc    Accept a blood request
// @access  Private
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ msg: 'Request already accepted or completed' });

    request.donorId = req.user.id;
    request.status = 'Accepted';
    
    // Generate a unique matching ID (e.g., 6 character alphanumeric)
    request.matchingId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await request.save();
    
    // In a real app, send SMS with matching ID to receiver's pointOfContact here.

    res.json({ msg: 'Request accepted', matchingId: request.matchingId, request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/requests/complete
// @desc    Complete a blood request using matching ID
// @access  Private
router.post('/complete', auth, async (req, res) => {
  const { matchingId } = req.body;
  
  try {
    const request = await BloodRequest.findOne({ matchingId, donorId: req.user.id });
    if (!request) return res.status(404).json({ msg: 'Invalid Matching ID or Request not found' });
    if (request.status === 'Completed') return res.status(400).json({ msg: 'Donation already completed' });

    request.status = 'Completed';
    await request.save();

    // Auto-Register the Receiver if they are not already registered
    // We check if a user with this contact info exists
    let receiver = await User.findOne({ contactInfo: request.pointOfContact });
    
    if (!receiver) {
      receiver = new User({
        name: `Receiver_${request.pointOfContact}`, // Placeholder name
        contactInfo: request.pointOfContact,
        password: await require('bcryptjs').hash('tempPassword123!', await require('bcryptjs').genSalt(10)), // Temp password
        location: request.hospitalAddress,
        bloodGroup: request.bloodGroupRequired,
        isRegistered: false // Indicates they were auto-registered and haven't fully set up profile yet
      });
      await receiver.save();
    }
    
    request.receiverId = receiver._id;
    await request.save();

    res.json({ msg: 'Donation completed successfully. Receiver automatically registered.', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
