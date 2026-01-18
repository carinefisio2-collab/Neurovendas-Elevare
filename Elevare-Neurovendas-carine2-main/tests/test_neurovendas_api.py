"""
NeuroVendas API Tests - Comprehensive Backend Testing
Tests all critical API endpoints for the Elevare NeuroVendas platform
"""
import pytest
import requests
import os
import json
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://aivendas-1.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "beta@teste.com"
TEST_PASSWORD = "senha123"

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "NeuroVendas by Elevare"
        print(f"✅ Health check passed: {data}")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✅ Login successful for {TEST_EMAIL}")
        return data["token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid login correctly rejected")
    
    def test_get_current_user(self):
        """Test /api/auth/me with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✅ Get current user successful: {data['user']['name']}")
    
    def test_get_current_user_no_token(self):
        """Test /api/auth/me without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print("✅ Unauthorized access correctly rejected")


class TestDashboard:
    """Dashboard endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_dashboard_stats(self, auth_token):
        """Test /api/dashboard/stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "stats" in data
        print(f"✅ Dashboard stats retrieved: {data['stats']}")


class TestDiagnosis:
    """Diagnosis endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_diagnosis_status(self, auth_token):
        """Test /api/diagnosis/status endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/diagnosis/status",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "completed" in data
        print(f"✅ Diagnosis status: completed={data['completed']}")


class TestLeads:
    """Leads CRUD endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_leads(self, auth_token):
        """Test GET /api/leads endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/leads",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "leads" in data
        print(f"✅ Leads retrieved: {len(data['leads'])} leads")
    
    def test_create_and_delete_lead(self, auth_token):
        """Test POST and DELETE /api/leads endpoint"""
        # Create lead - using Portuguese field names as per LeadCreate model
        create_response = requests.post(
            f"{BASE_URL}/api/leads",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "nome": "TEST_Lead_API_Test",
                "telefone": "11999999999",
                "email": "test_api@test.com",
                "origem": "instagram",
                "temperatura": "frio",
                "observacoes": "Created by API test"
            }
        )
        assert create_response.status_code in [200, 201]
        created_lead = create_response.json()
        assert "lead" in created_lead or "id" in created_lead
        lead_id = created_lead.get("lead", {}).get("id") or created_lead.get("id")
        print(f"✅ Lead created: {lead_id}")
        
        # Delete lead
        if lead_id:
            delete_response = requests.delete(
                f"{BASE_URL}/api/leads/{lead_id}",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert delete_response.status_code in [200, 204]
            print(f"✅ Lead deleted: {lead_id}")


class TestBrandIdentity:
    """Brand Identity endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_brand_identity(self, auth_token):
        """Test GET /api/brand-identity endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/brand-identity",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✅ Brand identity retrieved")


class TestBiblioteca:
    """Biblioteca (Library) endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_prompts(self, auth_token):
        """Test GET /api/biblioteca/prompts endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/biblioteca/prompts",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✅ Biblioteca prompts retrieved")


class TestCalendario:
    """Calendario (Calendar) endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_calendar_events(self, auth_token):
        """Test GET /api/calendario/events endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/calendario/events",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # May return 200 or 404 if no events
        assert response.status_code in [200, 404]
        print(f"✅ Calendar events endpoint responded: {response.status_code}")


class TestAIFeatures:
    """AI Features endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["token"]
    
    def test_ai_chat_endpoint_exists(self, auth_token):
        """Test /api/ai/chat endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/ai/chat",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"message": "Olá"}
        )
        # Should not return 404 - endpoint exists
        assert response.status_code != 404
        print(f"✅ AI chat endpoint exists: {response.status_code}")


class TestLegalEndpoints:
    """Legal/LGPD endpoint tests"""
    
    def test_get_terms(self):
        """Test GET /api/legal/terms endpoint"""
        response = requests.get(f"{BASE_URL}/api/legal/terms")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "terms" in data
        print("✅ Terms endpoint working")
    
    def test_get_privacy(self):
        """Test GET /api/legal/privacy endpoint"""
        response = requests.get(f"{BASE_URL}/api/legal/privacy")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "privacy" in data
        print("✅ Privacy policy endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
