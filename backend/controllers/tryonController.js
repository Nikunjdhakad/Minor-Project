// SSL bypass is handled per-request via axiosNoSSL instance below

const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const https = require("https");
const sharp = require("sharp");
const { logActivity } = require("./activityController");

// Axios with browser-like headers + SSL bypass for Windows
const axiosNoSSL = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  responseType: "arraybuffer",
  timeout: 15000,
});

// Downloads image as buffer from any URL
async function downloadImage(url) {
  const response = await axiosNoSSL.get(url);
  return Buffer.from(response.data);
}

// Core compositing engine using sharp
async function compositeImages(personBuffer, garmentBuffer) {
  const personMeta = await sharp(personBuffer).metadata();
  const pWidth = personMeta.width;
  const pHeight = personMeta.height;

  // Resize garment to fit torso region
  const garmentWidth = Math.round(pWidth * 0.6);
  const garmentHeight = Math.round(pHeight * 0.4);

  const garmentResized = await sharp(garmentBuffer)
    .resize(garmentWidth, garmentHeight, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .toBuffer();

  // Position the garment in the upper-center of the body (torso area)
  const garmentLeft = Math.round((pWidth - garmentWidth) / 2);
  const garmentTop = Math.round(pHeight * 0.25);

  const composited = await sharp(personBuffer)
    .composite([
      {
        input: garmentResized,
        top: garmentTop,
        left: garmentLeft,
        blend: "multiply",
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return composited;
}

// VTON Orchestrator using local sharp compositing
const generateTryOn = async (req, res) => {
  try {
    const { personImage, garmentImage } = req.body;

    if (!personImage || !garmentImage) {
      return res
        .status(400)
        .json({ message: "Both personImage and garmentImage URLs are required." });
    }

    console.log("Downloading person and garment images...");

    // Download both images in parallel
    const [personBuffer, garmentBuffer] = await Promise.all([
      downloadImage(personImage),
      downloadImage(garmentImage),
    ]);

    console.log(
      `Images downloaded. Person: ${personBuffer.length} bytes, Garment: ${garmentBuffer.length} bytes`
    );

    console.log("Compositing garment onto person image with sharp...");
    const compositedBuffer = await compositeImages(personBuffer, garmentBuffer);

    // Upload composited result to Cloudinary
    console.log("Uploading result to Cloudinary...");
    const base64 = `data:image/jpeg;base64,${compositedBuffer.toString("base64")}`;
    const cldResult = await cloudinary.uploader.upload(base64, {
      resource_type: "image",
      folder: "tryon_results",
    });

    console.log("✅ Try-On complete! Result URL:", cldResult.secure_url);

    // Log activity
    await logActivity(req.user._id, "tryon", {
      garmentName: "Virtual Try-On",
    });

    res.json({
      success: true,
      mocked: false,
      generatedImage: cldResult.secure_url,
    });
  } catch (error) {
    console.error("VTON Error:", error.message);

    // Graceful fallback — return the person image as a preview
    res.status(200).json({
      success: false,
      mocked: true,
      error: error.message,
      generatedImage: req.body.personImage,
    });
  }
};

module.exports = { generateTryOn };
