import aws from 'aws-sdk';

const s3 = new aws.S3({
  endpoint: `https://${process.env.AWS_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  signatureVersion: 'v4',
});

export default s3;
