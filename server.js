require('dotenv').config();
const { createApp } = require('./src/app');

const PORT = Number(process.env.PORT) || 3002;
const app = createApp({ crmUrl: process.env.CRM_URL });

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`☕ FUTURE_FS_03: The Copper Kettle Café & Bistro`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`-------------------------------------------------`);
  console.log(`🔗 Connected CRM URL: ${process.env.CRM_URL || 'None (Local Mode)'}`);
  console.log(`📋 Pitch Document: See PITCH.md for complete client proposal`);
  console.log(`=================================================\n`);
});
