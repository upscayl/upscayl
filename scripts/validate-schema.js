const Ajv = require("ajv");
const path = require("path");
const fs = require("fs");
const { generateSchema } = require("./generate-schema");

const ajv = new Ajv();

console.log("Validating language files...");

// Load the base language file (en.json)
const enJsonPath = path.join(__dirname, "..", "renderer", "locales", "en.json");
const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));

// Generate the schema for en.json
const enSchema = generateSchema(enJson);
const validate = ajv.compile(enSchema);

// Validate other language files
const localesDir = path.join(__dirname, "..", "renderer", "locales");
const languageFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file !== "en.json");

languageFiles.forEach((file) => {
  const filePath = path.join(localesDir, file);
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const valid = validate(jsonData);

  if (!valid) {
    console.error(`Errors in ${file}:`);
    console.error(validate.errors);
  } else {
    console.log(`${file} is valid.`);
  }
});
