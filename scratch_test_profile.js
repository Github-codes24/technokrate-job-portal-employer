const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://new-job-portal-be-1.onrender.com/api';

async function testApi() {
  try {
    console.log('Logging in...');
    const signinRes = await axios.post(`${BASE_URL}/employer/user/signin`, {
      email: 'kajal12@gmail.com',
      password: 'Pass@1234',
    });

    const token = signinRes.data.token;
    console.log('Login successful. Token:', token);

    console.log('Fetching current profile details...');
    const profileRes = await axios.get(`${BASE_URL}/employer/combine/getdetail`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile retrieved successfully.');

    // Prepare update data simulating companySlice.js
    const fd = new FormData();
    // Simulate updating basic tagline or location
    fd.append('companyDetail', JSON.stringify({
      companyName: 'Acme Corporation',
      companyTagline: 'Building future teams',
      companyWebsite: 'https://acme.com',
      location: {
        countryCode: 'IN',
        stateCode: 'MH',
        name: 'Mumbai',
        cityName: 'Mumbai',
      }
    }));

    fd.append('businessDetail', JSON.stringify({
      fundedIn: '2020',
      typeOfCompany: 'IT',
      companySize: '11-50',
      aboutCompany: 'Test company description',
    }));

    fd.append('hiringPreference', JSON.stringify({
      hiringFor: 'Full Time',
      jobLocation: {
        countryCode: 'IN',
        stateCode: 'MH',
        name: 'Mumbai',
        cityName: 'Mumbai',
      },
      topHiringSkill: 'React, Node.js',
      averageHiringPerMonth: '5',
    }));

    fd.append('verificationAndDocumentation', JSON.stringify({
      companyLegalName: 'Acme Corp Pvt Ltd',
      companyRegisterNumber: '123456789',
      GSTNumber: '27AAAAA0000A1Z5',
      CINNumber: 'U12345MH2020PTC123456',
    }));

    console.log('Sending PUT /employer/combine/updatedetail request...');
    const updateRes = await axios.put(`${BASE_URL}/employer/combine/updatedetail`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...fd.getHeaders()
      }
    });

    console.log('Update Success!', updateRes.data);
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
    console.error('Error Headers:', err.response?.headers);
    if (err.response?.data?.message) {
      console.error('Backend Message:', err.response.data.message);
    }
  }
}

testApi();
