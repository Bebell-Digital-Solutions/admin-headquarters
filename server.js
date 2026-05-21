require('dotenv').config();   // loads .env when running locally
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());             // allow all origins (safe for personal vault)
app.use(express.json());     // parse JSON request bodies

// -------------------------------------------------------------------
// Configuration: list of services you want to proxy
// Each service has:
//   - scriptUrl: the Google Apps Script web app URL
//   - envKey:    the name of the environment variable holding its API key
// -------------------------------------------------------------------

const SERVICES = {
  productdyno: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_PRODUCTDYNO/exec',
    envKey: 'PRODUCTDYNO_API_KEY'
  },
  openai: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_OPENAI/exec',
    envKey: 'OPENAI_API_KEY'
  },
  deepseek: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_DEEPSEEK/exec',
    envKey: 'DEEPSEEK_API_KEY'
  },
  gemini: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_GEMINI/exec',
    envKey: 'GEMINI_API_KEY'
  },
  grok: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_GROK/exec',
    envKey: 'GROK_API_KEY'
  },
  perplexity: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_PERPLEXITY/exec',
    envKey: 'PERPLEXITY_API_KEY'
  },
  minimax: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_MINIMAX/exec',
    envKey: 'MINIMAX_API_KEY'
  },
  qwen: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_QWEN/exec',
    envKey: 'QWEN_API_KEY'
  },
  claude: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_CLAUDE/exec',
    envKey: 'CLAUDE_API_KEY'
  },
  mailerlite: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_MAILERLITE/exec',
    envKey: 'MAILERLITE_API_KEY'
  },
  chatbase: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_CHATBASE/exec',
    envKey: 'CHATBASE_API_KEY'
  },
  newoaks: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_NEWOAKS/exec',
    envKey: 'NEWOAKS_API_KEY'
  },
  anychat: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_ANYCHAT/exec',
    envKey: 'ANYCHAT_API_KEY'
  },
  stripe: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_STRIPE/exec',
    envKey: 'STRIPE_SECRET_KEY'
  },
  paypal: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_PAYPAL/exec',
    envKey: 'PAYPAL_SECRET_KEY'
  },
  zylvie: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_ZYLVIE/exec',
    envKey: 'ZYLVIE_API_KEY'
  },
'custom-application': {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_AHQ/exec',
    envKey: 'ADMIN_HQ_API_KEY'
  },
 'admin-headquarters-portal': {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbwCO8xHjJjUSNGlA9kd4YgYdIDGLs34wsnb785r427RAMxnRbMxjUsK-ZnY0ZjmzVKk/exec',
    envKey: 'ADMIN_HQ_API_KEY'
  },
  albato: {
    scriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER_ALBATO/exec',
    envKey: 'ALBATO_API_KEY'
  }
  // To add a new service later, just copy and paste an entry above!
};






// Master endpoint – your applications call this single URL
// Body format: { service: "otp", action: "request_otp", email: "..." }
// -------------------------------------------------------------------
app.post('/api/proxy', async (req, res) => {
  try {
    const { service, action, ...params } = req.body;

    // 1. Look up the service configuration
    const config = SERVICES[service];
    if (!config) {
      return res.status(400).json({ error: 'Unknown service: ' + service });
    }

    // 2. Get the real API key from environment variables
    const apiKey = process.env[config.envKey];
    if (!apiKey) {
      return res.status(500).json({ error: 'Server missing API key for ' + service });
    }

    // 3. Build the payload that Google Apps Script expects
    const payload = {
      apiKey,               // the secret key – injected safely
      action,
      ...params             // all other parameters from the client
    };

    // 4. Forward the request to Google Apps Script
    const response = await fetch(config.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 5. Send the response back to the original caller
    res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------------
// Health check (optional)
// -------------------------------------------------------------------
app.get('/', (req, res) => res.send('Master Vault is running.'));

// -------------------------------------------------------------------
// Start the server
// -------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Vault listening on port ${PORT}`));
