#!/bin/bash
# ================================================================
# Entrypoint: Build do APK Android
# Executado dentro do container Docker
# ================================================================
set -e

echo ""
echo "=========================================="
echo "  📦 Build APK - localizacao-tracker"
echo "=========================================="
echo ""

APP_DIR="/app/localizacao-tracker"
ANDROID_DIR="$APP_DIR/android"
ANDROID_CACHE_DIR="/root/.android-cache"

# ----------------------------------------------------------------
# Cache do projeto Android via rsync (android/ NÃO é mais mountpoint)
# ----------------------------------------------------------------
restore_android_cache() {
  mkdir -p "$ANDROID_CACHE_DIR"
  if [ -n "$(ls -A "$ANDROID_CACHE_DIR" 2>/dev/null)" ]; then
    echo "♻️  Restaurando cache do projeto Android..."
    mkdir -p "$ANDROID_DIR"
    rsync -a --delete "$ANDROID_CACHE_DIR"/ "$ANDROID_DIR"/
  fi
}

save_android_cache() {
  if [ -d "$ANDROID_DIR" ]; then
    echo "💾 Salvando cache do projeto Android..."
    mkdir -p "$ANDROID_CACHE_DIR"
    rsync -a --delete "$ANDROID_DIR"/ "$ANDROID_CACHE_DIR"/
  fi
}
# Garante que o cache é salvo mesmo se o build falhar no meio do caminho
trap save_android_cache EXIT

restore_android_cache

# ----------------------------------------------------------------
# 1. Expo Prebuild (somente quando necessário)
# ----------------------------------------------------------------
cd "$APP_DIR"

CONFIG_HASH=$(
  cat "$APP_DIR/app.json" \
      "$APP_DIR/package.json" \
      "$APP_DIR/package-lock.json" 2>/dev/null \
    | sha256sum | cut -d' ' -f1
)
CACHED_HASH=""
[ -f "$ANDROID_DIR/.build-config-hash" ] && CACHED_HASH=$(cat "$ANDROID_DIR/.build-config-hash")

NEEDS_PREBUILD=false
FORCE_CLEAN=false

if [ "$CLEAN_PREBUILD" = "1" ]; then
  NEEDS_PREBUILD=true
  FORCE_CLEAN=true
  echo "🔄 Prebuild forçado (CLEAN_PREBUILD=1)..."
elif [ ! -f "$ANDROID_DIR/gradlew" ]; then
  NEEDS_PREBUILD=true
  FORCE_CLEAN=true
  echo "🔨 Primeiro build — gerando projeto Android..."
elif [ "$CONFIG_HASH" != "$CACHED_HASH" ]; then
  NEEDS_PREBUILD=true
  FORCE_CLEAN=true
  echo "🔨 Config nativa alterada — regerando projeto Android..."
else
  echo "⚡ Prebuild em cache (use --clean-prebuild para regerar)."
fi

if [ "$NEEDS_PREBUILD" = true ]; then
  if [ "$FORCE_CLEAN" = true ]; then
    echo "🧹 Limpando projeto Android..."
    rm -rf "$ANDROID_DIR"
  fi

  echo "🔨 Executando expo prebuild..."
  npx expo prebuild --platform android --no-install

  echo "$CONFIG_HASH" > "$ANDROID_DIR/.build-config-hash"
fi

echo "🔧 Configurando Android SDK..."
mkdir -p android
echo "sdk.dir=${ANDROID_HOME}" > android/local.properties

# ----------------------------------------------------------------
# 2. Otimizações do Gradle
# ----------------------------------------------------------------
GRADLE_PROPS="android/gradle.properties"
touch "$GRADLE_PROPS"

append_gradle_prop() {
  local key=$1
  local value=$2
  if ! grep -q "^${key}=" "$GRADLE_PROPS" 2>/dev/null; then
    echo "${key}=${value}" >> "$GRADLE_PROPS"
  fi
}

append_gradle_prop "org.gradle.parallel" "true"
append_gradle_prop "org.gradle.caching" "true"
append_gradle_prop "org.gradle.configureondemand" "true"
append_gradle_prop "org.gradle.jvmargs" "-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError"

# ----------------------------------------------------------------
# 3. Gradle Build (compila o APK)
# ----------------------------------------------------------------
echo ""
echo "🏗️  Compilando APK..."
cd android
chmod +x ./gradlew
./gradlew assembleRelease \
  --no-daemon \
  --build-cache \
  --parallel \
  -x lint \
  -x test

# ----------------------------------------------------------------
# 4. Copiar APK para diretório de output
# ----------------------------------------------------------------
echo ""
echo "📋 Copiando APK..."
mkdir -p /app/build

APK_PATH=$(find "$APP_DIR/android/app/build/outputs/apk" -name "*.apk" -type f | head -1)

if [ -z "$APK_PATH" ]; then
  echo "❌ Erro: APK não encontrado!"
  exit 1
fi

cp "$APK_PATH" /app/build/localizacao-tracker.apk

echo ""
echo "=========================================="
echo "  ✅ APK gerado com sucesso!"
echo "  📱 Arquivo: ./build/localizacao-tracker.apk"
echo "  📏 Tamanho: $(du -h /app/build/localizacao-tracker.apk | cut -f1)"
echo "=========================================="
echo ""
