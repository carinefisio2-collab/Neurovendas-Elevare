#!/bin/bash
# =============================================================================
# ELEVARE NEUROVENDAS - Script de Backup MongoDB
# Execução: ./backup_mongodb.sh ou via cron diário
# =============================================================================

set -e

# Configurações
BACKUP_DIR="/app/backups"
DB_NAME="elevare_db"
MONGO_HOST="localhost"
MONGO_PORT="27017"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="elevare_backup_${DATE}"
RETENTION_DAYS=7

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Criar diretório de backup se não existir
mkdir -p "${BACKUP_DIR}"

log_info "Iniciando backup do MongoDB..."
log_info "Database: ${DB_NAME}"
log_info "Destino: ${BACKUP_DIR}/${BACKUP_NAME}"

# Verificar se mongodump está disponível
if ! command -v mongodump &> /dev/null; then
    log_warn "mongodump não encontrado, usando método alternativo com mongoexport..."
    
    # Método alternativo: exportar cada collection como JSON
    EXPORT_DIR="${BACKUP_DIR}/${BACKUP_NAME}"
    mkdir -p "${EXPORT_DIR}"
    
    # Lista de collections principais
    COLLECTIONS=("users" "content_history" "diagnoses" "leads" "ebooks" "payment_transactions" "brand_identities")
    
    for COLLECTION in "${COLLECTIONS[@]}"; do
        log_info "Exportando collection: ${COLLECTION}"
        
        # Usar Python para exportar (mais confiável que mongoexport)
        python3 << EOF
import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

async def export_collection():
    client = AsyncIOMotorClient("mongodb://${MONGO_HOST}:${MONGO_PORT}")
    db = client["${DB_NAME}"]
    
    cursor = db["${COLLECTION}"].find({})
    documents = await cursor.to_list(length=None)
    
    with open("${EXPORT_DIR}/${COLLECTION}.json", "w") as f:
        json.dump(documents, f, cls=JSONEncoder, indent=2, ensure_ascii=False)
    
    print(f"Exportados {len(documents)} documentos de ${COLLECTION}")
    client.close()

asyncio.run(export_collection())
EOF
    done
    
    # Criar arquivo tar.gz
    log_info "Comprimindo backup..."
    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    rm -rf "${BACKUP_NAME}"
    
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
else
    # Método padrão com mongodump
    mongodump --host="${MONGO_HOST}" --port="${MONGO_PORT}" --db="${DB_NAME}" --out="${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Comprimir backup
    log_info "Comprimindo backup..."
    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    rm -rf "${BACKUP_NAME}"
    
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
fi

# Verificar se backup foi criado
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log_info "✅ Backup criado com sucesso!"
    log_info "Arquivo: ${BACKUP_FILE}"
    log_info "Tamanho: ${BACKUP_SIZE}"
else
    log_error "❌ Falha ao criar backup!"
    exit 1
fi

# Limpar backups antigos (manter últimos N dias)
log_info "Removendo backups com mais de ${RETENTION_DAYS} dias..."
find "${BACKUP_DIR}" -name "elevare_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

# Listar backups disponíveis
log_info "Backups disponíveis:"
ls -lh "${BACKUP_DIR}"/elevare_backup_*.tar.gz 2>/dev/null || echo "Nenhum backup encontrado"

log_info "Backup concluído!"

# Registrar no log do sistema
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup MongoDB concluído: ${BACKUP_FILE} (${BACKUP_SIZE})" >> "${BACKUP_DIR}/backup.log"
