FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install essential tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    nano \
    build-essential \
    libpq-dev \
    iputils-ping \
    netcat-openbsd \
    && apt-get clean

# Install Node.js 20 + pnpm (via corepack)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

RUN corepack enable

# pnpm global cache location (optional but recommended)
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Working directory
WORKDIR /workspace
