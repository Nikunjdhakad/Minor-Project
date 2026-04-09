/**
 * Validates all required environment variables at startup.
 * Fails fast with clear error messages if any are missing.
 */
function validateEnv() {
  const required = [
    { key: "MONGO_URI", hint: "MongoDB connection string" },
    { key: "JWT_SECRET", hint: "Secret key for JWT signing" },
    { key: "SERPAPI_KEY", hint: "SerpApi key for Google Lens visual search" },
    { key: "CLOUDINARY_CLOUD_NAME", hint: "Cloudinary cloud name" },
    { key: "CLOUDINARY_API_KEY", hint: "Cloudinary API key" },
    { key: "CLOUDINARY_API_SECRET", hint: "Cloudinary API secret" },
  ];

  const missing = required.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables:\n");
    missing.forEach(({ key, hint }) => {
      console.error(`   • ${key} — ${hint}`);
    });
    console.error("\n   Add them to your .env file and restart.\n");
    process.exit(1);
  }

  console.log("✅ All environment variables validated.");
}

module.exports = validateEnv;
