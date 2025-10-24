#!/bin/sh
set -e

# Function to handle signals
handle_signal() {
    echo "Received signal, shutting down gracefully..."
    nginx -s quit
    exit 0
}

# Trap signals
trap handle_signal SIGTERM SIGINT

# Start nginx in the foreground
echo "Starting nginx..."
exec nginx -g 'daemon off;'
