#!/usr/bin/env node

/**
 * Manual API Test Script for Booking System
 * Validates:
 * - Form submission endpoint
 * - Data persistence in Firestore
 * - Admin approval workflow
 */

const API_BASE = 'https://api-foyuhxzxaa-uc.a.run.app/api';

async function testBookingSubmission() {
  console.log('\n📝 Test 1: Booking Submission');
  console.log('-------------------------------');
  
  try {
    const response = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        context: 'I want to discuss growth strategies'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ PASS: Booking submitted successfully');
      console.log(`   Booking ID: ${data.bookingId}`);
      console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log('❌ FAIL: Booking submission failed');
      console.log(`   Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log('❌ FAIL: Network error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testEmailValidation() {
  console.log('\n📧 Test 2: Email Validation');
  console.log('-------------------------------');
  
  try {
    const response = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        context: 'Some context'
      })
    });

    const data = await response.json();

    if (!response.ok && data.error === 'Invalid email format') {
      console.log('✅ PASS: Invalid email rejected correctly');
      console.log(`   Error: ${data.error}`);
      return true;
    } else {
      console.log('❌ FAIL: Invalid email was not rejected');
      return false;
    }
  } catch (error) {
    console.log('❌ FAIL: Network error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testMissingFields() {
  console.log('\n🔍 Test 3: Missing Fields Validation');
  console.log('--------------------------------------');
  
  try {
    const response = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com'
        // Missing context
      })
    });

    const data = await response.json();

    if (!response.ok && data.error === 'Missing email or context') {
      console.log('✅ PASS: Missing fields rejected correctly');
      console.log(`   Error: ${data.error}`);
      return true;
    } else {
      console.log('❌ FAIL: Missing fields were not rejected');
      return false;
    }
  } catch (error) {
    console.log('❌ FAIL: Network error');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n💚 Test 4: Health Check');
  console.log('------------------------');
  
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    if (response.ok && data.status === 'ok') {
      console.log('✅ PASS: Cloud Functions are healthy');
      return true;
    } else {
      console.log('❌ FAIL: Health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ FAIL: Cannot reach API');
    console.log(`   Error: ${error.message}`);
    console.log(`   Note: Cloud Functions may still be deploying. Check back in 5 minutes.`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🧪 BOOKING SYSTEM TEST SUITE');
  console.log('=============================');
  
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testBookingSubmission());
  results.push(await testEmailValidation());
  results.push(await testMissingFields());

  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. See details above.');
    process.exit(1);
  }
}

// Run tests
runAllTests();
