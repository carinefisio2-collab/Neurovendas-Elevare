#!/usr/bin/env python3
"""
Test WhatsApp Scripts list endpoint
"""

import requests

# Configuration
BASE_URL = "https://aivendas-1.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_USER_EMAIL = "maria.teste@example.com"
TEST_USER_PASSWORD = "teste123"

def login():
    """Login and get token"""
    payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{API_BASE}/auth/login", json=payload, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token"):
            return data["token"]
    return None

def test_list_whatsapp_scripts(token):
    """Test list WhatsApp scripts endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/whatsapp-scripts", headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and "scripts" in data:
            scripts = data["scripts"]
            print(f"✅ List WhatsApp Scripts: {len(scripts)} scripts found")
            for script in scripts[:3]:  # Show first 3
                print(f"   - {script.get('scenario')}: {script.get('service')}")
            return True
    
    print(f"❌ List WhatsApp Scripts failed: {response.status_code} - {response.text}")
    return False

def main():
    token = login()
    if token:
        test_list_whatsapp_scripts(token)

if __name__ == "__main__":
    main()