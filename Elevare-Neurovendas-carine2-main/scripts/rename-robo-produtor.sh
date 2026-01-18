#!/bin/bash

# Script para renomear Robô Produtor para NeuroPost Elevare

echo "Substituindo 'Robô Produtor' por 'NeuroPost™ Elevare' em todos os arquivos..."

# Substituir em arquivos .tsx
find /app/frontend/src -type f -name "*.tsx" -exec sed -i 's/Robô Produtor/NeuroPost™ Elevare/g' {} \;
find /app/frontend/src -type f -name "*.tsx" -exec sed -i 's/Robo Produtor/NeuroPost Elevare/g' {} \;

echo "✅ Substituição concluída!"
