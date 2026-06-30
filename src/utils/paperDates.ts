import { en, registerTranslation } from 'react-native-paper-dates';

let registered = false;

export function ensureDatePickerTranslations() {
  if (registered) return;
  registerTranslation('en', en);
  registered = true;
}
