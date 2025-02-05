import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'; // Add this at the top

import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import Product from '../models/productModels.js';
import Category from '../models/categoryModels.js';
import Order from '../models/orderModels.js';
import Transaction from '../models/transactionModels.js';
import User from '../models/userModels.js';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { COOKIE_PASSWORD } from './config.js';

// Register Mongoose Adapter for AdminJS
AdminJS.registerAdapter(AdminJSMongoose);

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default admin credentials
const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'xshankarmishra@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'Shankar1162@',
};

// Authentication logic for AdminJS
const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

// Build AdminJS Dashboard
export const buildAdminJS = async (app) => {
  // Define AdminJS resources (collections to be managed in the admin panel)
  const adminJS = new AdminJS({
    resources: [
      { resource: Product },
      { resource: Category },
      { resource: Order },
      { resource: Transaction },
      { resource: User },
    ],
    rootPath: '/admin', // Path where AdminJS will be available
    branding: {
      companyName: 'SmartKart Admin',
      logo: path.resolve(__dirname, '../assets/logo.png'), // Correct logo path
      softwareBrothers: false, // Removes AdminJS branding
    },
    theme: 'dark', // Optional: Choose a theme like 'dark', 'light', etc.
  });

  // Set up session store for AdminJS
  const MongoDBSessionStore = connectMongoDBSession(session);
  const store = new MongoDBSessionStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
  });

  // Set up AdminJS router with authentication
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJS,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: COOKIE_PASSWORD || 'supersecretpassword',
    },
    null,
    {
      store,
      resave: false,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD || 'supersecretpassword',
    }
  );

  // Use AdminJS router in the app
  app.use(adminJS.options.rootPath, adminRouter);

  // Use express.json() as body parser (recommended in newer versions of Express)
  app.use(express.json());  // Replaces body-parser.json()
};
