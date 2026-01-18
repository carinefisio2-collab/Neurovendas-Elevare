"""
Test Suite for Diagnóstico de Presença Visual Endpoint
Tests the POST /api/ai/diagnostico-presenca-visual endpoint with image uploads
"""
import pytest
import requests
import os
import io
import base64
from PIL import Image, ImageDraw

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://aivendas-1.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "beta@teste.com"
TEST_PASSWORD = "senha123"


def create_test_image(width=400, height=400, color=(100, 150, 200)):
    """Create a simple test image in memory"""
    img = Image.new('RGB', (width, height), color=color)
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr


def create_instagram_mock_image():
    """Create a realistic Instagram profile mock image with text content"""
    img = Image.new('RGB', (400, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Purple header
    draw.rectangle([0, 0, 400, 100], fill=(138, 43, 226))
    draw.text((20, 30), "@clinica_estetica", fill=(255, 255, 255))
    draw.text((20, 60), "Especialista em Harmonização", fill=(255, 255, 255))
    
    # Profile area
    draw.ellipse([150, 120, 250, 220], fill=(200, 200, 200))
    draw.text((20, 240), "Bio: Transformando vidas através", fill=(0, 0, 0))
    draw.text((20, 260), "da estética avançada", fill=(0, 0, 0))
    draw.text((20, 290), "São Paulo | Agende", fill=(0, 0, 0))
    draw.text((20, 320), "Link na bio", fill=(0, 0, 0))
    
    # Stats
    draw.text((50, 360), "1.2K posts", fill=(0, 0, 0))
    draw.text((150, 360), "15K seguidores", fill=(0, 0, 0))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes


def create_landing_mock_image():
    """Create a realistic landing page mock image with text content"""
    img = Image.new('RGB', (400, 600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Header
    draw.rectangle([0, 0, 400, 80], fill=(138, 43, 226))
    draw.text((20, 30), "Clínica Estética Premium", fill=(255, 255, 255))
    
    # Main content
    draw.text((20, 100), "Harmonização Facial", fill=(0, 0, 0))
    draw.text((20, 130), "Resultados Naturais", fill=(0, 0, 0))
    
    # CTA Button
    draw.rectangle([50, 180, 350, 230], fill=(138, 43, 226))
    draw.text((100, 195), "AGENDE SUA AVALIAÇÃO", fill=(255, 255, 255))
    
    # Services
    draw.text((20, 260), "Nossos Serviços:", fill=(0, 0, 0))
    draw.text((20, 290), "Botox, Preenchimento", fill=(0, 0, 0))
    
    # Testimonial
    draw.rectangle([20, 370, 380, 450], fill=(245, 245, 245))
    draw.text((30, 380), "Melhor clínica da região!", fill=(0, 0, 0))
    draw.text((30, 410), "- Maria S., cliente", fill=(128, 128, 128))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes


def get_auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    raise Exception(f"Login failed: {response.status_code} - {response.text}")


class TestLoginEndpoint:
    """Test login endpoint works correctly"""
    
    def test_login_success(self):
        """Test POST /api/auth/login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✅ Login successful for {TEST_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test POST /api/auth/login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid login correctly rejected with 401")


class TestDiagnosticoPresencaVisualValidation:
    """Test validation for the visual diagnostic endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        return get_auth_token()
    
    def test_endpoint_requires_authentication(self):
        """Test that endpoint requires authentication"""
        instagram_img = create_test_image(400, 400, (255, 100, 100))
        pagina_img = create_test_image(400, 400, (100, 255, 100))
        
        files = {
            'instagramImage': ('instagram.png', instagram_img, 'image/png'),
            'paginaImage': ('pagina.png', pagina_img, 'image/png')
        }
        data = {
            'instagramHandle': 'test_handle',
            'linkBio': 'https://example.com'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Endpoint correctly requires authentication")
    
    def test_missing_instagram_handle(self, auth_token):
        """Test that endpoint validates required instagramHandle field"""
        instagram_img = create_test_image(400, 400, (100, 150, 200))
        pagina_img = create_test_image(400, 400, (200, 150, 100))
        
        files = {
            'instagramImage': ('instagram.png', instagram_img, 'image/png'),
            'paginaImage': ('pagina.png', pagina_img, 'image/png')
        }
        data = {
            'linkBio': 'https://example.com/bio'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 422, f"Expected 422 for missing field, got {response.status_code}"
        print("✅ Endpoint correctly validates missing instagramHandle")
    
    def test_missing_link_bio(self, auth_token):
        """Test that endpoint validates required linkBio field"""
        instagram_img = create_test_image(400, 400, (100, 150, 200))
        pagina_img = create_test_image(400, 400, (200, 150, 100))
        
        files = {
            'instagramImage': ('instagram.png', instagram_img, 'image/png'),
            'paginaImage': ('pagina.png', pagina_img, 'image/png')
        }
        data = {
            'instagramHandle': 'test_handle'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 422, f"Expected 422 for missing field, got {response.status_code}"
        print("✅ Endpoint correctly validates missing linkBio")
    
    def test_missing_instagram_image(self, auth_token):
        """Test that endpoint validates required instagramImage file"""
        pagina_img = create_test_image(400, 400, (200, 150, 100))
        
        files = {
            'paginaImage': ('pagina.png', pagina_img, 'image/png')
        }
        data = {
            'instagramHandle': 'test_handle',
            'linkBio': 'https://example.com/bio'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 422, f"Expected 422 for missing file, got {response.status_code}"
        print("✅ Endpoint correctly validates missing instagramImage")
    
    def test_missing_pagina_image(self, auth_token):
        """Test that endpoint validates required paginaImage file"""
        instagram_img = create_test_image(400, 400, (100, 150, 200))
        
        files = {
            'instagramImage': ('instagram.png', instagram_img, 'image/png')
        }
        data = {
            'instagramHandle': 'test_handle',
            'linkBio': 'https://example.com/bio'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 422, f"Expected 422 for missing file, got {response.status_code}"
        print("✅ Endpoint correctly validates missing paginaImage")


class TestDiagnosticoPresencaVisualFunctionality:
    """Test functionality of the visual diagnostic endpoint with realistic images"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        return get_auth_token()
    
    def test_full_visual_analysis_with_response_structure(self, auth_token):
        """
        Test complete visual analysis with realistic mock images.
        Verifies endpoint accepts FormData, returns 200, and response has correct structure.
        """
        # Create realistic mock images with content for AI to analyze
        instagram_img = create_instagram_mock_image()
        pagina_img = create_landing_mock_image()
        
        files = {
            'instagramImage': ('instagram.png', instagram_img, 'image/png'),
            'paginaImage': ('pagina.png', pagina_img, 'image/png')
        }
        data = {
            'instagramHandle': 'clinica_estetica_teste',
            'linkBio': 'https://linktr.ee/clinica_teste'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        print(f"Response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Response body: {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        resp_data = response.json()
        assert resp_data["success"] == True, f"Expected success=True, got {resp_data}"
        assert "result" in resp_data, "Response should contain 'result' field"
        
        result = resp_data["result"]
        print(f"✅ Endpoint returned valid response with result keys: {list(result.keys())}")
        
        # Verify all expected top-level keys
        expected_keys = ["resumoExecutivo", "instagramAnalise", "paginaAnalise", "coerencia", "autoridade", "melhorias"]
        for key in expected_keys:
            assert key in result, f"Missing expected key: {key}"
        print(f"✅ Response contains all expected keys: {expected_keys}")
        
        # Verify resumoExecutivo structure
        resumo = result.get("resumoExecutivo", {})
        assert "notaGeral" in resumo, "resumoExecutivo should have notaGeral"
        assert "pontuacoes" in resumo, "resumoExecutivo should have pontuacoes"
        assert "status" in resumo, "resumoExecutivo should have status"
        print(f"✅ resumoExecutivo: notaGeral={resumo['notaGeral']}, status={resumo['status']}")
        
        # Verify pontuacoes structure
        pontuacoes = resumo.get("pontuacoes", {})
        expected_pontuacoes = ["autoridadePercebida", "coerenciaVisual", "provaSocial", "conversaoCTAs", "presencaDigitalGlobal"]
        for key in expected_pontuacoes:
            assert key in pontuacoes, f"pontuacoes should have {key}"
        print(f"✅ pontuacoes contains all expected scores")
        
        # Verify instagramAnalise structure
        instagram = result.get("instagramAnalise", {})
        assert "pontosFortes" in instagram, "instagramAnalise should have pontosFortes"
        assert "pontosFracos" in instagram, "instagramAnalise should have pontosFracos"
        print(f"✅ instagramAnalise structure is correct")
        
        # Verify paginaAnalise structure
        pagina = result.get("paginaAnalise", {})
        assert "pontosFortes" in pagina, "paginaAnalise should have pontosFortes"
        assert "pontosFracos" in pagina, "paginaAnalise should have pontosFracos"
        print(f"✅ paginaAnalise structure is correct")
        
        # Verify coerencia structure
        coerencia = result.get("coerencia", {})
        assert "status" in coerencia, "coerencia should have status"
        assert "analise" in coerencia, "coerencia should have analise"
        valid_statuses = ["alinhado", "parcial", "quebrado"]
        assert coerencia["status"] in valid_statuses, f"coerencia.status should be one of {valid_statuses}"
        print(f"✅ coerencia: status={coerencia['status']}")
        
        # Verify autoridade structure
        autoridade = result.get("autoridade", {})
        assert "percepcao" in autoridade, "autoridade should have percepcao"
        assert "justificativa" in autoridade, "autoridade should have justificativa"
        print(f"✅ autoridade: percepcao={autoridade['percepcao']}")
        
        # Verify melhorias structure
        melhorias = result.get("melhorias", [])
        assert isinstance(melhorias, list), "melhorias should be a list"
        assert len(melhorias) > 0, "melhorias should have at least one item"
        first_melhoria = melhorias[0]
        assert "acao" in first_melhoria, "melhoria should have acao"
        assert "impacto" in first_melhoria, "melhoria should have impacto"
        print(f"✅ melhorias: {len(melhorias)} improvements suggested")
        
        print("✅ ALL STRUCTURE VALIDATIONS PASSED")
    
    def test_jpeg_images_accepted(self, auth_token):
        """Test that endpoint accepts JPEG images"""
        # Create JPEG images with content
        instagram_img = Image.new('RGB', (400, 600), color=(255, 255, 255))
        draw = ImageDraw.Draw(instagram_img)
        draw.rectangle([0, 0, 400, 100], fill=(138, 43, 226))
        draw.text((20, 30), "@test_jpeg_profile", fill=(255, 255, 255))
        draw.text((20, 240), "Bio: Test JPEG image", fill=(0, 0, 0))
        instagram_bytes = io.BytesIO()
        instagram_img.save(instagram_bytes, format='JPEG')
        instagram_bytes.seek(0)
        
        pagina_img = Image.new('RGB', (400, 600), color=(255, 255, 255))
        draw = ImageDraw.Draw(pagina_img)
        draw.rectangle([0, 0, 400, 80], fill=(138, 43, 226))
        draw.text((20, 30), "Landing Page JPEG", fill=(255, 255, 255))
        draw.rectangle([50, 180, 350, 230], fill=(138, 43, 226))
        draw.text((100, 195), "CTA BUTTON", fill=(255, 255, 255))
        pagina_bytes = io.BytesIO()
        pagina_img.save(pagina_bytes, format='JPEG')
        pagina_bytes.seek(0)
        
        files = {
            'instagramImage': ('instagram.jpg', instagram_bytes, 'image/jpeg'),
            'paginaImage': ('pagina.jpg', pagina_bytes, 'image/jpeg')
        }
        data = {
            'instagramHandle': 'test_jpeg',
            'linkBio': 'https://example.com/bio'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/diagnostico-presenca-visual",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        assert response.status_code == 200, f"JPEG images should be accepted: {response.text}"
        resp_data = response.json()
        assert resp_data["success"] == True
        print("✅ JPEG images are accepted and processed correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
