"""
Serviço de Geração de Imagens para NeuroVendas
Usa OpenAI GPT-Image via Emergent Integrations
"""
import os
import base64
from dotenv import load_dotenv

load_dotenv()

class ImageGenerator:
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY não configurada")
    
    async def generate_image(
        self,
        prompt: str,
        style: str = "professional",
        model: str = "gpt-image-1"
    ) -> dict:
        """
        Gera uma imagem baseada no prompt
        
        Args:
            prompt: Descrição da imagem desejada
            style: Estilo da imagem (professional, artistic, minimalist, etc.)
            model: Modelo a usar (gpt-image-1.5, gpt-image-1, dall-e-3)
        
        Returns:
            dict com image_base64 e metadata
        """
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        # Enriquecer o prompt para estética profissional
        enhanced_prompt = self._enhance_prompt(prompt, style)
        
        try:
            image_gen = OpenAIImageGeneration(api_key=self.api_key)
            
            images = await image_gen.generate_images(
                prompt=enhanced_prompt,
                model=model,
                number_of_images=1
            )
            
            if images and len(images) > 0:
                image_base64 = base64.b64encode(images[0]).decode('utf-8')
                return {
                    "success": True,
                    "image_base64": image_base64,
                    "prompt_used": enhanced_prompt,
                    "model": model
                }
            else:
                return {
                    "success": False,
                    "error": "Nenhuma imagem foi gerada"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _enhance_prompt(self, prompt: str, style: str) -> str:
        """
        Enriquece o prompt para gerar imagens adequadas para estética/beleza
        """
        style_modifiers = {
            "professional": "professional photography, clean background, soft lighting, high-end aesthetic clinic style",
            "artistic": "artistic composition, creative lighting, elegant and sophisticated",
            "minimalist": "minimalist design, clean lines, modern aesthetic, white space",
            "warm": "warm tones, cozy atmosphere, inviting and welcoming",
            "luxurious": "luxury spa atmosphere, premium feel, gold accents, elegant",
            "natural": "natural lighting, organic elements, fresh and pure aesthetic",
            "clinical": "clean clinical setting, professional medical aesthetic, trustworthy"
        }
        
        base_modifiers = "suitable for Instagram, high quality, visually appealing, beauty and wellness industry"
        style_mod = style_modifiers.get(style, style_modifiers["professional"])
        
        # Adicionar contexto de estética se não estiver presente
        aesthetic_context = ""
        aesthetic_keywords = ["estética", "beleza", "tratamento", "pele", "corpo", "facial", "beauty", "skin", "aesthetic"]
        if not any(kw in prompt.lower() for kw in aesthetic_keywords):
            aesthetic_context = "for aesthetic clinic and beauty professional, "
        
        enhanced = f"{prompt}, {aesthetic_context}{style_mod}, {base_modifiers}"
        return enhanced
    
    async def generate_post_image(
        self,
        post_title: str,
        post_type: str,
        tema_base: str,
        foco_neuro: str,
        cerebro_alvo: str
    ) -> dict:
        """
        Gera uma imagem específica para um post de campanha
        
        Args:
            post_title: Título do post
            post_type: Tipo de conteúdo (Reels, Carrossel, Stories, etc.)
            tema_base: Tema da campanha
            foco_neuro: Foco neurovendedor (Impacto, Identificação, etc.)
            cerebro_alvo: Cérebro alvo (Reptiliano, Límbico, Neocórtex)
        
        Returns:
            dict com imagem e metadata
        """
        # Mapear foco neuro para estilo visual
        style_map = {
            "Impacto": "bold, eye-catching, dramatic lighting, attention-grabbing",
            "Identificação": "warm, relatable, human connection, emotional",
            "Autoridade": "professional, credible, scientific, trustworthy",
            "Educação": "clear, informative, infographic style, educational",
            "Prova+Oferta": "before and after style, testimonial feel, transformation",
            "Encantamento": "magical, beautiful, aspirational, dreamy"
        }
        
        cerebro_map = {
            "Reptiliano": "instinctive, primal, survival-oriented imagery",
            "Límbico": "emotional, heartfelt, connection-focused",
            "Neocórtex": "logical, structured, information-rich",
            "Límbico/Reptiliano": "emotional with urgency, compelling"
        }
        
        style_modifier = style_map.get(foco_neuro, "professional")
        cerebro_modifier = cerebro_map.get(cerebro_alvo, "balanced")
        
        # Construir prompt baseado no contexto do post
        prompt = f"""
        Create an image for Instagram {post_type} about: {tema_base}.
        Theme: {post_title}.
        Visual style: {style_modifier}.
        Emotional tone: {cerebro_modifier}.
        For beauty and aesthetic professionals.
        No text on image, clean composition.
        """
        
        # Escolher estilo baseado no foco
        style = "professional"
        if foco_neuro in ["Impacto", "Prova+Oferta"]:
            style = "clinical"
        elif foco_neuro in ["Identificação", "Encantamento"]:
            style = "warm"
        elif foco_neuro in ["Autoridade", "Educação"]:
            style = "minimalist"
        
        return await self.generate_image(prompt, style)


# Singleton instance
_image_generator = None

def get_image_generator() -> ImageGenerator:
    global _image_generator
    if _image_generator is None:
        _image_generator = ImageGenerator()
    return _image_generator
