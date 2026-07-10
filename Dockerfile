# syntax=docker/dockerfile:1.4
# ================================================================
# Dockerfile - Build local do APK Android
# Expo SDK 54 / React Native 0.81 / localizacao-tracker
# ================================================================
# Uso:
#   docker compose run --rm build-apk
#   ou: ./build-apk.sh
#
# O APK será gerado em ./build/localizacao-tracker.apk
# ================================================================

FROM node:20-slim

# ----------------------------------------------------------------
# 1. Instalar JDK 17 e ferramentas de sistema
# ----------------------------------------------------------------
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    wget \
    unzip \
    git \
    rsync \
    && rm -rf /var/lib/apt/lists/*

# Detectar arquitetura e criar symlink para JAVA_HOME portável
RUN ln -s /usr/lib/jvm/java-17-openjdk-$(dpkg --print-architecture) /usr/lib/jvm/java-17
ENV JAVA_HOME=/usr/lib/jvm/java-17

# ----------------------------------------------------------------
# 2. Instalar Android SDK
# ----------------------------------------------------------------
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
         -O /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools && \
    mv /tmp/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# Aceitar licenças e instalar componentes do SDK
# Versões compatíveis com Expo SDK 54 / React Native 0.81
RUN yes | sdkmanager --licenses > /dev/null 2>&1 && \
    sdkmanager \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0" \
    "ndk;27.1.12297006" \
    "cmake;3.22.1"

# ----------------------------------------------------------------
# 3. Instalar dependências Node.js
# ----------------------------------------------------------------
WORKDIR /app/localizacao-tracker

# Copiar apenas package.json's primeiro para cache de dependências
COPY localizacao-tracker/package.json localizacao-tracker/package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ----------------------------------------------------------------
# 4. Copiar código do app (fallback quando volumes não estão montados)
# ----------------------------------------------------------------
COPY localizacao-tracker/ ./

# ----------------------------------------------------------------
# 5. Entrypoint para build
# ----------------------------------------------------------------
COPY docker/entrypoint-build.sh /usr/local/bin/entrypoint-build.sh
RUN chmod +x /usr/local/bin/entrypoint-build.sh

ENTRYPOINT ["/usr/local/bin/entrypoint-build.sh"]
