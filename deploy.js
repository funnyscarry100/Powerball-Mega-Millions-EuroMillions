import 'dotenv/config';
import fetch from 'node-fetch';
import fs from 'fs';
import archiver from 'archiver';

const SITE_FOLDER = './public'; // or './dist' or '.' depending on your project
const ZIP_PATH = './site.zip';

async function zipSite() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(ZIP_PATH);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(ZIP_PATH));
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(SITE_FOLDER, false);
    archive.finalize();
  });
}

async function deployToNetlify() {
  console.log('📦 Zipping site...');
  await zipSite();

  console.log('🚀 Deploying to Netlify...');
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NETLIFY_API_TOKEN}`,
      'Content-Type': 'application/zip'
    },
    body: fs.createReadStream(ZIP_PATH)
  });

  const data = await res.json();
  console.log('✅ Deployment complete:', data.deploy_ssl_url || data.admin_url || data);
}

deployToNetlify().catch(err => {
  console.error('❌ Deployment failed:', err);
});
