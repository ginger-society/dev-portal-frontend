# Stage 1: Build the project
FROM docker.io/gingersociety/vite-react-builder:latest AS builder

# Set environment variables using build arguments
ARG GINGER_TOKEN

ENV GINGER_TOKEN=$GINGER_TOKEN
ENV PNPM_HOME=/pnpm-cache
RUN pnpm config set store-dir $PNPM_HOME

# Copy project files
COPY . .

# Authenticate and connect
RUN ginger-auth token-login ${GINGER_TOKEN}
# RUN ginger-connector refer stage
# RUN ginger-connector connect stage

# # Install dependencies and build
# RUN pnpm i
# RUN pnpm build



RUN ginger-connector refer stage
RUN ginger-connector connect stage

ENV HUSKY=0
RUN pnpm i --ignore-scripts=false

# # Install dependencies and build
RUN pnpm i
RUN pnpm build
# Stage 2: Serve the built files with Nginx
FROM docker.io/nginx:alpine

# Copy built files from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
