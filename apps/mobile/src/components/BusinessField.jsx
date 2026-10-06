import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../utils/theme';
export default function BusinessField({ label, value, onChangeText, numeric = false, multiline = false }) {
  const { colors } = useTheme();
  return <View style={{ gap: 6 }}><Text style={{ color: colors.text }}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={numeric ? 'decimal-pad' : 'default'} multiline={multiline} maxLength={multiline ? 1000 : 200} style={{ padding: 14, color: colors.text, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border }} /></View>;
}
