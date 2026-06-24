#!/usr/bin/env node

/**
 * Helper script to generate environment variables for deployment
 * Run this script after creating Supabase project
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== MartPOS Environment Setup Helper ===\n');

const questions = [
  {
    key: 'DB_HOST',
    prompt: 'Enter Supabase Database Host (e.g., db.xxx.supabase.co): ',
    example: 'db.myproject.supabase.co'
  },
  {
    key: 'DB_USER',
    prompt: 'Enter Supabase Database User (e.g., postgres.xxx): ',
    example: 'postgres.myproject'
  },
  {
    key: 'DB_PASSWORD',
    prompt: 'Enter Supabase Database Password: ',
    example: 'your-password'
  },
  {
    key: 'SUPABASE_URL',
    prompt: 'Enter Supabase Project URL (e.g., https://xxx.supabase.co): ',
    example: 'https://myproject.supabase.co'
  },
  {
    key: 'SUPABASE_ANON_KEY',
    prompt: 'Enter Supabase Anon Key: ',
    example: 'eyJ...'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    prompt: 'Enter Supabase Service Role Key: ',
    example: 'eyJ...'
  }
];

const answers = {};

let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    generateEnvFiles();
    rl.close();
    return;
  }

  const question = questions[currentQuestion];
  rl.question(question.prompt, (answer) => {
    if (!answer.trim()) {
      console.log('This field is required. Please try again.\n');
      return;
    }
    answers[question.key] = answer.trim();
    currentQuestion++;
    askQuestion();
  });
}

function generateEnvFiles() {
  console.log('\n=== Generating Environment Files ===\n');

  // Backend .env
  const backendEnv = `DB_TYPE=postgres
DB_HOST=${answers.DB_HOST}
DB_USER=${answers.DB_USER}
DB_PASSWORD=${answers.DB_PASSWORD}
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
SUPABASE_URL=${answers.SUPABASE_URL}
SUPABASE_ANON_KEY=${answers.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${answers.SUPABASE_SERVICE_ROLE_KEY}
PORT=5000
NODE_ENV=production
`;

  console.log('=== Backend Environment Variables ===');
  console.log(backendEnv);
  console.log('\nCopy these to Vercel backend project settings.\n');

  // Frontend .env.production
  const frontendEnv = `VITE_API_URL=https://your-backend-url.vercel.app/api
`;

  console.log('=== Frontend Environment Variables ===');
  console.log(frontendEnv);
  console.log('Replace "your-backend-url.vercel.app" with your actual Vercel backend URL.\n');

  console.log('=== Setup Complete! ===');
  console.log('1. Copy backend variables to Vercel backend project');
  console.log('2. Deploy backend first to get the URL');
  console.log('3. Update frontend VITE_API_URL with backend URL');
  console.log('4. Deploy frontend\n');
}

askQuestion();
