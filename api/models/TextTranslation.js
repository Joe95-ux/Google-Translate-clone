const mongoose = require('mongoose');
const { Schema } = mongoose;

const TextTranslationSchema = new Schema({
  user_id: { type: String, required: true },
  organization_id: { type: String, default: null },
  fromLanguage: { type: String, required: true },
  toLanguage: { type: String, required: true },
  textToTranslate: { type: String, required: true },
  translation: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const TextTranslation = mongoose.model('TextTranslation', TextTranslationSchema);
module.exports = TextTranslation;