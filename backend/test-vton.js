process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require("dotenv").config();
const axios = require("axios");
const https = require("https");
const sharp = require("sharp");
const cloudinary = require("./config/cloudinary");

const axiosNoSSL = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0" },
  responseType: "arraybuffer",
  timeout: 15000,
});

async function test() {
  // Use our own Cloudinary-hosted images (these are guaranteed accessible)
  // Swap these with real URLs from your app if you have them
  const personUrl = "https://res.cloudinary.com/demo/image/upload/w_400/sample.jpg";
  const garmentUrl = "https://res.cloudinary.com/demo/image/upload/w_400/shoes.jpg";

  console.log("Step 1: Downloading images...");
  const [pBuf, gBuf] = await Promise.all([
    axiosNoSSL.get(personUrl).then(r => Buffer.from(r.data)),
    axiosNoSSL.get(garmentUrl).then(r => Buffer.from(r.data)),
  ]);
  console.log(`✅ Person: ${pBuf.length} bytes | Garment: ${gBuf.length} bytes`);

  console.log("\nStep 2: Compositing with sharp...");
  const personMeta = await sharp(pBuf).metadata();
  const gW = Math.round(personMeta.width * 0.6);
  const gH = Math.round(personMeta.height * 0.4);

  const garmentResized = await sharp(gBuf)
    .resize(gW, gH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .toBuffer();

  const composited = await sharp(pBuf)
    .composite([{ input: garmentResized, top: Math.round(personMeta.height * 0.25), left: Math.round((personMeta.width - gW) / 2), blend: "multiply" }])
    .jpeg({ quality: 90 })
    .toBuffer();

  console.log(`✅ Composited image: ${composited.length} bytes`);

  console.log("\nStep 3: Uploading to Cloudinary...");
  const b64 = `data:image/jpeg;base64,${composited.toString("base64")}`;
  const result = await cloudinary.uploader.upload(b64, { resource_type: "image", folder: "tryon_test" });
  console.log("✅ Result URL:", result.secure_url);
}

test().catch(console.error);
