function generateSchema(json) {
  if (json === null) {
    return { type: "null" };
  }

  const type = Array.isArray(json) ? "array" : typeof json;
  const schema = { type };

  switch (type) {
    case "object":
      const properties = {};
      const required = [];

      for (const [key, value] of Object.entries(json)) {
        properties[key] = generateSchema(value);
        required.push(key);
      }

      schema.properties = properties;
      if (required.length > 0) {
        schema.required = required;
      }
      break;

    case "array":
      if (json.length > 0) {
        // Assume all items in array are of the same type as the first item
        schema.items = generateSchema(json[0]);
      }
      break;
  }

  return schema;
}

module.exports = { generateSchema };

// Example usage:
/*
const obj = {
    name: "John",
    age: 30,
    address: {
        street: "123 Main St",
        city: "Boston"
    },
    hobbies: ["reading", "swimming"]
};

const schema = generateSchema(obj);
console.log(JSON.stringify(schema, null, 2));
*/
