import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function testR2() {
  const testKey = 'documents/test_connectivity.txt';
  console.log('Testing R2 upload to bucket:', process.env.R2_BUCKET_NAME);
  
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: testKey,
    Body: Buffer.from('R2 connectivity test successful at ' + new Date().toISOString()),
    ContentType: 'text/plain',
  }));

  console.log('Successfully uploaded test object to R2!');
  const publicUrl = `${process.env.R2_PUBLIC_URL?.replace(/\/+$/, '')}/${testKey}`;
  console.log('Public URL:', publicUrl);
}

testR2().catch(err => {
  console.error('R2 test error:', err);
  process.exit(1);
});
