ARG BASE_IMAGE=ubuntu:22.04

FROM ${BASE_IMAGE} AS compile-image
ARG BASE_IMAGE=ubuntu:22.04
ENV PYTHONUNBUFFERED TRUE

RUN --mount=type=cache,id=apt-dev,target=/var/cache/apt \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
    ca-certificates \
    build-essential \
    python3-dev \
    python3-distutils \
    python3-venv \
    python3-opencv \
    openjdk-11-jre-headless \
    curl \
    git \
    vim \
    cmake \
    ffmpeg \
    wget \
    libnss3-tools \
    && rm -rf /var/lib/apt/lists/* \
    && cd /tmp \
    && curl -O https://bootstrap.pypa.io/get-pip.py \
    && python3 get-pip.py




#Install whisper
RUN pip install git+https://github.com/openai/whisper.git 




#mkcer 
# RUN git clone https://github.com/FiloSottile/mkcert && cd mkcert go build -ldflags "-X main.Version=$(git describe --tags)"
# RUN /bin/sh -c "mkcert -install && \
# mkcert -cert-file /root/.local/share/mkcert/mkcert.pem \
# -key-file /root/.local/share/mkcert/mkcert.key localhost.dev"
RUN wget -O /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64 \
    && chmod +x /usr/local/bin/mkcert

RUN mkcert -install && mkcert 0.0.0.0

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile", "/0.0.0.0-key.pem", "--ssl-certfile", "/0.0.0.0.pem"]