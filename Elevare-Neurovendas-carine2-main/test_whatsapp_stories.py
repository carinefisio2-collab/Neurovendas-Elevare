#!/usr/bin/env python3
"""
Test WhatsApp Scripts and Story Sequences features specifically
"""

import requests
import json

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
            print("✅ Login successful")
            return data["token"]
    
    print("❌ Login failed")
    return None

def test_whatsapp_scenarios(token):
    """Test WhatsApp scenarios endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/ai/whatsapp-scenarios", headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("scenarios"):
            scenarios = data["scenarios"]
            print(f"✅ WhatsApp Scenarios: {len(scenarios)} scenarios available")
            for scenario in scenarios:
                print(f"   - {scenario.get('id')}: {scenario.get('label')}")
            return True
    
    print(f"❌ WhatsApp Scenarios failed: {response.status_code} - {response.text}")
    return False

def test_generate_whatsapp_script(token):
    """Test WhatsApp script generation"""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "scenario": "primeiro_contato",
        "service": "Limpeza de pele",
        "client_name": "Maria",
        "context": "Cliente veio pelo Instagram"
    }
    
    print("🔄 Generating WhatsApp script (may take 20-30 seconds)...")
    response = requests.post(f"{API_BASE}/ai/generate-whatsapp-script", json=payload, headers=headers, timeout=40)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("script"):
            script = data["script"]
            print("✅ WhatsApp Script generated successfully")
            print(f"   - Messages: {len(script.get('messages', []))}")
            print(f"   - Objection handlers: {len(script.get('objection_handlers', []))}")
            print(f"   - Closing options: {len(script.get('closing_options', []))}")
            print(f"   - Tips: {len(script.get('tips', []))}")
            return True
    
    print(f"❌ WhatsApp Script generation failed: {response.status_code} - {response.text}")
    return False

def test_story_types(token):
    """Test story types endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE}/ai/story-types", headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("story_types"):
            story_types = data["story_types"]
            print(f"✅ Story Types: {len(story_types)} types available")
            for story_type in story_types:
                print(f"   - {story_type.get('id')}: {story_type.get('label')}")
            return True
    
    print(f"❌ Story Types failed: {response.status_code} - {response.text}")
    return False

def test_generate_story_sequence(token):
    """Test story sequence generation"""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "theme": "Rotina de skincare matinal",
        "story_type": "educativo",
        "number_of_stories": 5
    }
    
    print("🔄 Generating story sequence (may take 20-30 seconds)...")
    response = requests.post(f"{API_BASE}/ai/generate-story-sequence", json=payload, headers=headers, timeout=40)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("sequence"):
            sequence = data["sequence"]
            stories = sequence.get("stories", [])
            print("✅ Story Sequence generated successfully")
            print(f"   - Stories: {len(stories)}")
            print(f"   - Final CTA: {'Yes' if sequence.get('final_cta') else 'No'}")
            print(f"   - Tips: {len(sequence.get('tips', []))}")
            
            # Show story phases
            if stories:
                phases = [story.get('phase') for story in stories]
                print(f"   - Phases: {', '.join(phases)}")
            return True
    
    print(f"❌ Story Sequence generation failed: {response.status_code} - {response.text}")
    return False

def main():
    print("=== Testing WhatsApp Scripts and Story Sequences ===")
    
    # Login
    token = login()
    if not token:
        return
    
    print("\n--- WhatsApp Scripts Tests ---")
    test_whatsapp_scenarios(token)
    test_generate_whatsapp_script(token)
    
    print("\n--- Story Sequences Tests ---")
    test_story_types(token)
    test_generate_story_sequence(token)
    
    print("\n=== Testing Complete ===")

if __name__ == "__main__":
    main()