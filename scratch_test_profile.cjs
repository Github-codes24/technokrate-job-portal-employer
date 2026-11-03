const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://new-job-portal-be-1.onrender.com/api';

const normalizeWebsite = (value) => {
  if (!value) return "";
  const v = String(value).trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
};

const normalizeYear = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

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
    
    const profileData = profileRes.data.user || profileRes.data;
    console.log('Fetched profile:', JSON.stringify(profileData, null, 2));

    const p = profileData;
    const cd = p.companyDetail || {};
    const bd = p.businessDetail || {};
    const hp = p.hiringPreference || {};
    const vd = p.verificationAndDocumentation || {};

    // Mimic EditCompanyProfile.jsx initialValues + payload logic
    const formValues = {
      companyName: cd.companyName || p.name || "",
      tagline: cd.companyTagline || "",
      website: normalizeWebsite(cd.companyWebsite || ""),
      phoneNumber: p.mobileNumber
        ? String(p.mobileNumber).replace(/^\+91/, "").trim()
        : "",
      email: p.email || "",
      locationCityName: cd.location?.name || "",
      locationCountryCode: cd.location?.countryCode || "IN",
      locationStateCode: cd.location?.stateCode || "MH",
      foundedIn: normalizeYear(bd.fundedIn || ""),
      type: bd.typeOfCompany || "",
      companySize: bd.companySize || "",
      about: bd.aboutCompany || "",
      hiringFor: hp.hiringFor || "",
      avgHiringPerMonth: hp.averageHiringPerMonth || "",
      jobLocationCountryCode: hp.jobLocation?.countryCode || "IN",
      jobLocationStateCode: hp.jobLocation?.stateCode || "MH",
      jobLocationCityName: hp.jobLocation?.name || "",
      companyLegalName: vd.companyLegalName || "",
      regNumber: vd.companyRegisterNumber || "",
      gstNumber: vd.GSTNumber || "",
      cinNumber: vd.CINNumber || "",
    };

    console.log('Mapped formValues:', JSON.stringify(formValues, null, 2));

    // Simulate updateCompanyProfile thunk payload logic
    const fd = new FormData();

    fd.append("companyDetail", JSON.stringify({
      companyName:    formValues.companyName    || "",
      companyTagline: formValues.tagline        || "",
      companyWebsite: formValues.website        || "",
      location: formValues.locationCityName
        ? {
            countryCode: formValues.locationCountryCode || "IN",
            stateCode:   formValues.locationStateCode   || "MH",
            name:        formValues.locationCityName,
            cityName:    formValues.locationCityName,
          }
        : null,
    }));

    fd.append("businessDetail", JSON.stringify({
      fundedIn:      formValues.foundedIn   || "",
      typeOfCompany: formValues.type        || "",
      companySize:   formValues.companySize || "",
      aboutCompany:  formValues.about       || "",
    }));

    const topSkills = ""; // or from topHiringSkill
    fd.append("hiringPreference", JSON.stringify({
      hiringFor: formValues.hiringFor || "",
      jobLocation: formValues.jobLocationCityName
        ? {
            countryCode: formValues.jobLocationCountryCode || "IN",
            stateCode:   formValues.jobLocationStateCode   || "MH",
            name:        formValues.jobLocationCityName,
            cityName:    formValues.jobLocationCityName,
          }
        : null,
      topHiringSkill:        topSkills,
      averageHiringPerMonth: String(formValues.avgHiringPerMonth || ""),
    }));

    fd.append("verificationAndDocumentation", JSON.stringify({
      companyLegalName:      formValues.companyLegalName || "",
      companyRegisterNumber: formValues.regNumber        || "",
      GSTNumber:             formValues.gstNumber        || "",
      CINNumber:             formValues.cinNumber        || "",
    }));

    console.log('Sending PUT /employer/combine/updatedetail request with mapped details...');
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
    if (err.response?.data?.message) {
      console.error('Backend Message:', err.response.data.message);
    }
  }
}

testApi();
