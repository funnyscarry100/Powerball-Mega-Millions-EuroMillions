import 'dotenv/config';
import fetch from 'node-fetch';

const deploy = async () => {
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NETLIFY_API_TOKEN}`,
      'Content-Type': 'application/zip'
    },
    body: '...' // zip your site files or use netlify-cli for auto deploy
  });

  const data = await res.json();
  console.log('✅ Deployment response:', data);
};

deploy();
