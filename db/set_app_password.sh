set -e

echo "🔐 Configurando password para app_reports_reader..."

if [ -z "$APP_READER_PASSWORD" ]; then
    echo "❌ ERROR: Variable APP_READER_PASSWORD no está definida"
    exit 1
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER ROLE app_reports_reader WITH PASSWORD '$APP_READER_PASSWORD';
EOSQL

echo "✅ Password configurado exitosamente"
echo "ℹ️  El role app_reports_reader puede ahora conectarse con la password configurada"
