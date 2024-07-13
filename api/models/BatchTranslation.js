const mongoose = require('mongoose');
const { Schema } = mongoose;

const BatchTranslationSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
  fromLanguage: { type: String, required: true },
  toLanguage: { type: [String], required: true },  // Array of strings
  input_document_paths: { type: [String], required: true },  // Array of strings
  outputDocumentPaths: { type: [String], required: true },  // Array of strings
  timestamp: { type: Date, default: Date.now }
});

const BatchTranslation = mongoose.model('BatchTranslation', BatchTranslationSchema);
module.exports = BatchTranslation;