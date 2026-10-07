import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../utils/theme';
export default function BusinessField({ label, value, onChangeText, numeric = false, multiline = false }) {
  const { colors } = useTheme();
  return <View style={{ gap: 8 }}><Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={numeric ? 'decimal-pad' : 'default'} multiline={multiline} maxLength={multiline ? 1000 : 200} placeholderTextColor={colors.textTertiary} style={{ minHeight: multiline ? 96 : 52, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, backgroundColor: colors.surface, borderRadius: 15, borderWidth: 1, borderColor: colors.border, textAlignVertical: multiline ? 'top' : 'center' }} /></View>;
}
