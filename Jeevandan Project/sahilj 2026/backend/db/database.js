// In-memory database with seed data for the Blood Donation Management System
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory data store
const db = {
  users: [],
  donors: [],
  bloodUnits: [],
  camps: [],
  hospitalRequests: [],
  donationHistory: [],
  checkins: [],
  transfusions: [],
  emergencyRequests: [],
  notifications: [],
  communityPosts: [],
};

async function seedDatabase() {
  const salt = await bcrypt.genSalt(10);

  // Seed Users (3 roles)
  db.users = [
    { id: 'donor-1', email: 'arjun@example.com', password: await bcrypt.hash('donor123', salt), role: 'donor', name: 'Arjun Sharma', donorId: 'd001' },
    { id: 'donor-2', email: 'priya@example.com', password: await bcrypt.hash('donor123', salt), role: 'donor', name: 'Priya Patel', donorId: 'd002' },
    { id: 'bb-1', email: 'bb@lifeflow.com', password: await bcrypt.hash('bank123', salt), role: 'bloodbank', name: 'LifeFlow Blood Bank', bankId: 'bb001' },
    { id: 'hosp-1', email: 'hospital@aiims.com', password: await bcrypt.hash('hospital123', salt), role: 'hospital', name: 'AIIMS Hospital', hospitalId: 'h001' },
  ];

  // Seed Donors
  db.donors = [
    {
      id: 'd001', userId: 'donor-1', name: 'Arjun Sharma', age: 27, bloodGroup: 'B+',
      weight: 72, contact: '+91-9876543210', email: 'arjun@example.com',
      address: '12, Connaught Place, New Delhi - 110001',
      lastDonation: '2026-05-10', totalDonations: 8, points: 2400,
      medicalHistory: 'Healthy, No chronic conditions',
      eligibleDate: '2026-08-10', isEligible: true,
      badge: 'Gold Hero', avatar: 'A',
    },
    {
      id: 'd002', userId: 'donor-2', name: 'Priya Patel', age: 24, bloodGroup: 'O+',
      weight: 58, contact: '+91-9988776655', email: 'priya@example.com',
      address: '45, Bandra West, Mumbai - 400050',
      lastDonation: '2026-03-22', totalDonations: 12, points: 3600,
      medicalHistory: 'Healthy',
      eligibleDate: '2026-06-22', isEligible: true,
      badge: 'Platinum Hero', avatar: 'P',
    },
  ];

  // Seed Blood Units (Inventory for blood bank)
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  let unitSeq = 1;
  bloodGroups.forEach(group => {
    const count = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < count; i++) {
      const collected = new Date(2026, 6, Math.floor(Math.random() * 30) + 1);
      const expiry = new Date(collected);
      expiry.setDate(expiry.getDate() + 35);
      db.bloodUnits.push({
        id: `BU-${String(unitSeq++).padStart(4, '0')}`,
        bloodGroup: group,
        donorId: Math.random() > 0.5 ? 'd001' : 'd002',
        collectedDate: collected.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        status: ['Available', 'Tested', 'Available', 'Available', 'Reserved'][Math.floor(Math.random() * 5)],
        hivTest: Math.random() > 0.1 ? 'Negative' : 'Pending',
        hepatitisB: 'Negative', hepatitisC: 'Negative', malaria: 'Negative', syphilis: 'Negative',
        batchNo: `BAT-2026-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
        volume: 450,
        campId: 'camp-1',
      });
    }
  });

  // Seed Camps
  db.camps = [
    { id: 'camp-1', name: 'India Gate Mega Camp', date: '2026-08-15', location: 'India Gate, New Delhi', lat: 28.6129, lng: 77.2295, organizer: 'Red Cross India', status: 'Upcoming', slots: 200, bookedSlots: 87, city: 'New Delhi', description: 'National Independence Day Donation Camp', contact: '011-23456789' },
    { id: 'camp-2', name: 'Juhu Beach Camp', date: '2026-08-20', location: 'Juhu Beach, Mumbai', lat: 19.0996, lng: 72.8265, organizer: 'LifeFlow Blood Bank', status: 'Upcoming', slots: 150, bookedSlots: 43, city: 'Mumbai', description: 'Coastal community drive', contact: '022-98765432' },
    { id: 'camp-3', name: 'Cubbon Park Camp', date: '2026-09-01', location: 'Cubbon Park, Bangalore', lat: 12.9763, lng: 77.5929, organizer: 'Bangalore Blood Bank', status: 'Upcoming', slots: 100, bookedSlots: 22, city: 'Bangalore', description: 'Weekend community initiative', contact: '080-12345678' },
    { id: 'camp-4', name: 'Sector 17 Camp', date: '2026-07-28', location: 'Sector 17, Chandigarh', lat: 30.7333, lng: 76.7794, organizer: 'PGI Blood Bank', status: 'Completed', slots: 120, bookedSlots: 120, city: 'Chandigarh', description: 'Annual city camp', contact: '0172-5656565' },
  ];

  // Seed Donation History
  db.donationHistory = [
    { id: 'dh-1', donorId: 'd001', date: '2026-05-10', location: 'AIIMS Blood Bank, Delhi', hospital: 'AIIMS', units: 1, certificateId: 'CERT-2026-001', bloodGroup: 'B+' },
    { id: 'dh-2', donorId: 'd001', date: '2026-02-14', location: 'Valentine Camp, Delhi', hospital: 'LifeFlow Bank', units: 1, certificateId: 'CERT-2026-002', bloodGroup: 'B+' },
    { id: 'dh-3', donorId: 'd001', date: '2025-11-01', location: 'Red Cross Center, Delhi', hospital: 'Red Cross', units: 1, certificateId: 'CERT-2025-041', bloodGroup: 'B+' },
    { id: 'dh-4', donorId: 'd002', date: '2026-03-22', location: 'Lilavati Hospital, Mumbai', hospital: 'Lilavati', units: 1, certificateId: 'CERT-2026-032', bloodGroup: 'O+' },
    { id: 'dh-5', donorId: 'd002', date: '2025-12-15', location: 'Bandra Camp, Mumbai', hospital: 'KEM Hospital', units: 1, certificateId: 'CERT-2025-119', bloodGroup: 'O+' },
  ];

  // Seed Emergency Requests
  db.emergencyRequests = [
    { id: 'em-1', patientName: 'Rahul Mehta', bloodGroup: 'B+', units: 2, hospital: 'AIIMS New Delhi', urgency: 'Critical', status: 'Active', createdAt: new Date().toISOString(), distance: 3.2, contact: '011-26588500', description: 'Post surgery blood requirement', respondedDonors: [] },
    { id: 'em-2', patientName: 'Sunita Joshi', bloodGroup: 'O+', units: 3, hospital: 'Safdarjung Hospital', urgency: 'Emergency', status: 'Active', createdAt: new Date().toISOString(), distance: 5.1, contact: '011-26707444', description: 'Accident victim', respondedDonors: [] },
    { id: 'em-3', patientName: 'Baby Krishna', bloodGroup: 'AB-', units: 1, hospital: 'Lady Hardinge', urgency: 'Critical', status: 'Active', createdAt: new Date().toISOString(), distance: 7.8, contact: '011-23344000', description: 'Neonatal surgery', respondedDonors: [] },
    { id: 'em-4', patientName: 'Fatima Sheikh', bloodGroup: 'A-', units: 2, hospital: 'RML Hospital', urgency: 'Moderate', status: 'Fulfilled', createdAt: new Date(Date.now() - 86400000).toISOString(), distance: 4.5, contact: '011-23365525', description: 'Thalassemia treatment', respondedDonors: ['d001'] },
  ];

  // Seed Hospital Requests
  db.hospitalRequests = [
    { id: 'hr-1', patientName: 'Vikram Singh', patientId: 'PAT-001', bloodGroup: 'A+', units: 2, urgency: 'Emergency', status: 'Dispatched', doctor: 'Dr. Meera Nair', ward: 'ICU', hospitalId: 'h001', createdAt: new Date(Date.now() - 7200000).toISOString(), approvedAt: new Date(Date.now() - 3600000).toISOString(), dispatchedAt: new Date(Date.now() - 1800000).toISOString(), receivedAt: null, notes: 'Surgery scheduled at 8 PM' },
    { id: 'hr-2', patientName: 'Ananya Rao', patientId: 'PAT-002', bloodGroup: 'B-', units: 1, urgency: 'Routine', status: 'Pending', doctor: 'Dr. Sanjay Kumar', ward: 'Oncology', hospitalId: 'h001', createdAt: new Date(Date.now() - 1800000).toISOString(), approvedAt: null, dispatchedAt: null, receivedAt: null, notes: 'Chemotherapy cycle 3' },
    { id: 'hr-3', patientName: 'Ram Prasad', patientId: 'PAT-003', bloodGroup: 'O+', units: 4, urgency: 'Critical', status: 'Received', doctor: 'Dr. Priti Shah', ward: 'Surgery', hospitalId: 'h001', createdAt: new Date(Date.now() - 86400000).toISOString(), approvedAt: new Date(Date.now() - 82800000).toISOString(), dispatchedAt: new Date(Date.now() - 79200000).toISOString(), receivedAt: new Date(Date.now() - 72000000).toISOString(), notes: 'Road accident' },
  ];

  // Seed Transfusion Logs
  db.transfusions = [
    { id: 'tf-1', patientName: 'Ram Prasad', patientId: 'PAT-003', bloodUnit: 'BU-0001', bloodGroup: 'O+', date: new Date(Date.now() - 72000000).toISOString(), doctor: 'Dr. Priti Shah', nurse: 'Nurse Kamla', reaction: 'None', ward: 'Surgery', hospitalId: 'h001', units: 1 },
    { id: 'tf-2', patientName: 'Ram Prasad', patientId: 'PAT-003', bloodUnit: 'BU-0002', bloodGroup: 'O+', date: new Date(Date.now() - 68400000).toISOString(), doctor: 'Dr. Priti Shah', nurse: 'Nurse Kamla', reaction: 'Minor fever (managed)', ward: 'Surgery', hospitalId: 'h001', units: 1 },
  ];

  // Seed Community Posts
  db.communityPosts = [
    { id: 'cp-1', donorId: 'd002', donorName: 'Priya Patel', bloodGroup: 'O+', badge: 'Platinum Hero', message: 'Just completed my 12th donation! The feeling of knowing I\'ve potentially saved lives is indescribable. Join us! 🩸❤️', likes: 47, comments: 12, timestamp: new Date(Date.now() - 86400000).toISOString(), avatar: 'P' },
    { id: 'cp-2', donorId: 'd001', donorName: 'Arjun Sharma', bloodGroup: 'B+', badge: 'Gold Hero', message: 'Got a call from AIIMS today - the patient whose blood I donated last month has fully recovered. This is why we donate! 💪', likes: 89, comments: 23, timestamp: new Date(Date.now() - 172800000).toISOString(), avatar: 'A' },
    { id: 'cp-3', donorId: 'guest-3', donorName: 'Meera Iyer', bloodGroup: 'AB-', badge: 'Silver Hero', message: 'First time donor here! Was nervous but the staff was amazing. Book your slot today, it only takes 30 minutes to save a life!', likes: 34, comments: 8, timestamp: new Date(Date.now() - 259200000).toISOString(), avatar: 'M' },
  ];

  // Seed Notifications
  db.notifications = [
    { id: 'n-1', userId: 'donor-1', title: 'You\'re Eligible to Donate!', message: 'It\'s been 90 days since your last donation. Time to be a hero again!', type: 'eligibility', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n-2', userId: 'donor-1', title: 'Emergency Request Near You', message: 'B+ blood needed urgently at AIIMS, 3.2km away', type: 'emergency', read: false, timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'n-3', userId: 'donor-1', title: 'Camp Reminder', message: 'India Gate Mega Camp is in 8 days. Your slot is confirmed!', type: 'camp', read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];

  console.log('✅ Database seeded successfully!');
  console.log(`   Users: ${db.users.length}, Donors: ${db.donors.length}, Blood Units: ${db.bloodUnits.length}`);
  console.log(`   Camps: ${db.camps.length}, Hospital Requests: ${db.hospitalRequests.length}`);
}

module.exports = { db, seedDatabase };
