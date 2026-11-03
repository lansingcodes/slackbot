module.exports = (name, value) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(`${name} must be valid JSON with double-quoted property names and string values`)
  }
}
