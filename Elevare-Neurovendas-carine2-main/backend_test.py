#!/usr/bin/env python3
"""
Backend API Testing for Elevare NeuroVendas
Testing the onboarding flow authentication endpoints
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class ElevareAPITester:
    def __init__(self, base_url="https://aivendas-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def test_register_endpoint(self):
        """Test user registration endpoint"""
        print("\n🔍 Testing /api/auth/register endpoint...")
        
        # Test data
        test_email = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@test.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['access_token', 'token_type', 'user']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Register Response Structure", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Check user data structure
                user_data = data['user']
                user_required_fields = ['id', 'email', 'name', 'role', 'credits_remaining']
                user_missing_fields = [field for field in user_required_fields if field not in user_data]
                
                if user_missing_fields:
                    self.log_test("Register User Data Structure", False, f"Missing user fields: {user_missing_fields}")
                    return False
                
                # Verify user gets 100 credits (as per onboarding flow)
                if user_data.get('credits_remaining') != 100:
                    self.log_test("Register Credits Assignment", False, f"Expected 100 credits, got {user_data.get('credits_remaining')}")
                    return False
                
                # Store token for further tests
                self.token = data['access_token']
                
                self.log_test("Register Endpoint", True, f"User created with ID: {user_data['id']}")
                self.log_test("Register Response Structure", True)
                self.log_test("Register User Data Structure", True)
                self.log_test("Register Credits Assignment", True)
                return True
                
            else:
                self.log_test("Register Endpoint", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Register Endpoint", False, f"Request error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("Register Endpoint", False, f"Unexpected error: {str(e)}")
            return False

    def test_duplicate_registration(self):
        """Test that duplicate email registration fails properly"""
        print("\n🔍 Testing duplicate email registration...")
        
        # Use same email as previous test
        test_email = f"duplicate_test@test.com"
        test_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        try:
            # First registration
            response1 = requests.post(
                f"{self.base_url}/api/auth/register",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            # Second registration with same email
            response2 = requests.post(
                f"{self.base_url}/api/auth/register",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response2.status_code == 400:
                data = response2.json()
                if "already registered" in data.get('detail', '').lower():
                    self.log_test("Duplicate Email Prevention", True)
                    return True
                else:
                    self.log_test("Duplicate Email Prevention", False, f"Wrong error message: {data.get('detail')}")
                    return False
            else:
                self.log_test("Duplicate Email Prevention", False, f"Expected 400, got {response2.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Duplicate Email Prevention", False, f"Error: {str(e)}")
            return False

    def test_me_endpoint(self):
        """Test /api/auth/me endpoint with token"""
        if not self.token:
            self.log_test("Me Endpoint", False, "No token available")
            return False
            
        print("\n🔍 Testing /api/auth/me endpoint...")
        
        try:
            response = requests.get(
                f"{self.base_url}/api/auth/me",
                headers={
                    'Authorization': f'Bearer {self.token}',
                    'Content-Type': 'application/json'
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'email', 'name', 'role']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Me Endpoint", False, f"Missing fields: {missing_fields}")
                    return False
                
                self.log_test("Me Endpoint", True, f"User data retrieved for: {data['email']}")
                return True
            else:
                self.log_test("Me Endpoint", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Me Endpoint", False, f"Error: {str(e)}")
            return False

    def test_invalid_registration_data(self):
        """Test registration with invalid data"""
        print("\n🔍 Testing registration with invalid data...")
        
        test_cases = [
            {
                "name": "Invalid Email Format",
                "data": {"email": "invalid-email", "password": "TestPass123!", "name": "Test User"},
                "expected_status": 422
            },
            {
                "name": "Short Password",
                "data": {"email": "test@test.com", "password": "123", "name": "Test User"},
                "expected_status": 422
            },
            {
                "name": "Missing Name",
                "data": {"email": "test@test.com", "password": "TestPass123!"},
                "expected_status": 422
            }
        ]
        
        all_passed = True
        for test_case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/auth/register",
                    json=test_case["data"],
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if response.status_code == test_case["expected_status"]:
                    self.log_test(f"Invalid Data - {test_case['name']}", True)
                else:
                    self.log_test(f"Invalid Data - {test_case['name']}", False, 
                                f"Expected {test_case['expected_status']}, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Invalid Data - {test_case['name']}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Elevare NeuroVendas Backend API Tests")
        print(f"🎯 Target URL: {self.base_url}")
        print("=" * 60)
        
        # Test registration flow
        self.test_register_endpoint()
        self.test_duplicate_registration()
        self.test_me_endpoint()
        self.test_invalid_registration_data()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check details above")
            return False

    def get_test_results(self):
        """Return test results for reporting"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "results": self.test_results
        }

def main():
    tester = ElevareAPITester()
    success = tester.run_all_tests()
    
    # Save results to file
    results = tester.get_test_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())