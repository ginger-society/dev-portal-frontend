FROM debian:bullseye-slim

WORKDIR /workspace

# Update package list
RUN apt update

# Install necessary packages
RUN apt install git zsh curl nano make gcc wget build-essential procps -y

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" -y

# Set zsh as the default shell
RUN echo "zsh" >> ~/.bashrc 

# Install Node.js
RUN sh -c "$(curl -fsSL https://deb.nodesource.com/setup_current.x)" -y
RUN apt install nodejs -y

# Install yarn globally
RUN npm install -g yarn

# Install Java
RUN apt install default-jdk -y

# Install OpenAPI Generator
RUN wget https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/6.2.0/openapi-generator-cli-6.2.0.jar -O /usr/local/bin/openapi-generator-cli.jar
RUN echo 'alias openapi-generator="java -jar /usr/local/bin/openapi-generator-cli.jar"' >> ~/.zshrc
RUN echo 'alias openapi-generator="java -jar /usr/local/bin/openapi-generator-cli.jar"' >> ~/.bashrc

# Make sure aliases are available in the current session
RUN zsh -c "source ~/.zshrc"
RUN bash -c "source ~/.bashrc"

 

