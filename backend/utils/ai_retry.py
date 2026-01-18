"""
Utilitário para chamadas de IA com Timeout e Retry
Implementa resiliência nas chamadas para OpenAI/LLM
"""

import asyncio
import logging
from typing import Callable, Any, Optional
from functools import wraps
import time

logger = logging.getLogger("elevare.ai_utils")

class AICallError(Exception):
    """Erro em chamada de IA"""
    def __init__(self, message: str, retry_count: int = 0, original_error: Optional[Exception] = None):
        self.message = message
        self.retry_count = retry_count
        self.original_error = original_error
        super().__init__(self.message)

class AICallConfig:
    """Configuração para chamadas de IA"""
    DEFAULT_TIMEOUT = 60  # segundos
    DEFAULT_MAX_RETRIES = 3
    DEFAULT_RETRY_DELAY = 2  # segundos
    DEFAULT_BACKOFF_MULTIPLIER = 2  # exponential backoff

async def ai_call_with_retry(
    func: Callable,
    *args,
    timeout: int = AICallConfig.DEFAULT_TIMEOUT,
    max_retries: int = AICallConfig.DEFAULT_MAX_RETRIES,
    retry_delay: float = AICallConfig.DEFAULT_RETRY_DELAY,
    backoff_multiplier: float = AICallConfig.DEFAULT_BACKOFF_MULTIPLIER,
    **kwargs
) -> Any:
    """
    Executa uma chamada de IA com timeout e retry automático.
    
    Args:
        func: Função assíncrona a ser executada
        timeout: Tempo máximo de espera em segundos
        max_retries: Número máximo de tentativas
        retry_delay: Delay inicial entre tentativas
        backoff_multiplier: Multiplicador para exponential backoff
        
    Returns:
        Resultado da função
        
    Raises:
        AICallError: Se todas as tentativas falharem
    """
    last_error = None
    current_delay = retry_delay
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Chamada IA - Tentativa {attempt + 1}/{max_retries}")
            start_time = time.time()
            
            # Executar com timeout
            result = await asyncio.wait_for(
                func(*args, **kwargs),
                timeout=timeout
            )
            
            elapsed = time.time() - start_time
            logger.info(f"Chamada IA concluída em {elapsed:.2f}s")
            
            return result
            
        except asyncio.TimeoutError:
            last_error = AICallError(
                f"Timeout após {timeout}s na tentativa {attempt + 1}",
                retry_count=attempt + 1
            )
            logger.warning(f"Timeout na chamada IA (tentativa {attempt + 1}/{max_retries})")
            
        except Exception as e:
            last_error = AICallError(
                f"Erro na chamada IA: {str(e)}",
                retry_count=attempt + 1,
                original_error=e
            )
            logger.warning(f"Erro na chamada IA (tentativa {attempt + 1}/{max_retries}): {str(e)}")
        
        # Se não for a última tentativa, aguardar antes de tentar novamente
        if attempt < max_retries - 1:
            logger.info(f"Aguardando {current_delay}s antes da próxima tentativa...")
            await asyncio.sleep(current_delay)
            current_delay *= backoff_multiplier  # Exponential backoff
    
    # Todas as tentativas falharam
    error_msg = f"Falha após {max_retries} tentativas. Último erro: {last_error.message if last_error else 'Desconhecido'}"
    logger.error(error_msg)
    raise AICallError(error_msg, retry_count=max_retries, original_error=last_error)

def with_ai_retry(
    timeout: int = AICallConfig.DEFAULT_TIMEOUT,
    max_retries: int = AICallConfig.DEFAULT_MAX_RETRIES,
    retry_delay: float = AICallConfig.DEFAULT_RETRY_DELAY
):
    """
    Decorator para adicionar timeout e retry a funções de IA.
    
    Uso:
        @with_ai_retry(timeout=30, max_retries=3)
        async def generate_content(...):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await ai_call_with_retry(
                func, *args,
                timeout=timeout,
                max_retries=max_retries,
                retry_delay=retry_delay,
                **kwargs
            )
        return wrapper
    return decorator

# Funções auxiliares para tratamento de erros
def get_user_friendly_error(error: AICallError) -> str:
    """Retorna mensagem amigável para o usuário"""
    if "timeout" in error.message.lower():
        return "A geração de conteúdo está demorando mais que o esperado. Por favor, tente novamente em alguns instantes."
    elif "rate limit" in error.message.lower():
        return "Muitas requisições simultâneas. Por favor, aguarde um momento e tente novamente."
    elif "api key" in error.message.lower():
        return "Erro de configuração do sistema. Por favor, entre em contato com o suporte."
    else:
        return "Ocorreu um erro na geração de conteúdo. Por favor, tente novamente."

def should_retry(error: Exception) -> bool:
    """Determina se o erro permite retry"""
    error_str = str(error).lower()
    
    # Erros que NÃO devem ser retentados
    no_retry_errors = [
        "invalid api key",
        "authentication failed",
        "insufficient_quota",
        "billing",
        "account"
    ]
    
    for no_retry in no_retry_errors:
        if no_retry in error_str:
            return False
    
    return True
