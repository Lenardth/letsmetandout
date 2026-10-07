import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { displayPhotoUrl } from '../utils/profilePhoto';

export default function ProfilePhoto({ url, name = '', size = 72, backgroundColor = '#52635A' }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const source = displayPhotoUrl(url);
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor, alignItems: 'center', justifyContent: 'center' }}>
    {source && failedUrl !== source ? <Image source={{ uri: source }} accessibilityLabel={`${name || 'Member'} profile picture`} resizeMode="cover" onError={() => setFailedUrl(source)} style={{ width: size, height: size }} /> : <Text accessibilityLabel={`${name || 'Member'} has no available profile picture`} style={{ color: '#FFFFFF', fontWeight: '700', fontSize: size / 3 }}>{initials}</Text>}
  </View>;
}
