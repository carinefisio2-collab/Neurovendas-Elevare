#!/bin/bash
# =============================================================================
# ELEVARE NEUROVENDAS - Configuração de Backup Automático
# Este script configura o cron para executar backup diário às 3h da manhã
# =============================================================================

# Adicionar job ao crontab
CRON_JOB="0 3 * * * /app/scripts/backup_mongodb.sh >> /app/backups/cron.log 2>&1"

# Verificar se já existe
if crontab -l 2>/dev/null | grep -q "backup_mongodb.sh"; then
    echo "✅ Backup automático já está configurado"
else
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Backup automático configurado para executar diariamente às 3:00 AM"
fi

# Mostrar crontab atual
echo ""
echo "Crontab atual:"
crontab -l 2>/dev/null || echo "Nenhum cron configurado"

echo ""
echo "📌 Para executar backup manualmente:"
echo "   /app/scripts/backup_mongodb.sh"
echo ""
echo "📌 Para verificar logs de backup:"
echo "   cat /app/backups/backup.log"
