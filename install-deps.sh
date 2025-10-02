#!/bin/bash

echo "Installing MongoDB dependencies for Maamul..."

# Install mongoose and bcryptjs
npm install mongoose bcryptjs

# Install TypeScript types
npm install --save-dev @types/bcryptjs @types/nodemailer

echo "Dependencies installed successfully!"
echo ""
echo "Make sure your .env file contains:"
echo "MONGO_URI=your_mongodb_connection_string"
echo ""
echo "You can now run the application with: npm run dev" 