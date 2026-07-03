const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const REGION =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const bucketName = process.env.S3_BUCKET_NAME || "boutique-hotel-images";

const client = new S3Client({ region: REGION });

async function uploadImageToS3({ fileName, contentType, base64 }) {
  if (!bucketName) {
    throw new Error("S3 bucket is not configured.");
  }

  const buffer = Buffer.from(base64, "base64");
  const key = `rooms/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `https://${bucketName}.s3.${REGION}.amazonaws.com/${key}`;
}

module.exports = { uploadImageToS3 };
