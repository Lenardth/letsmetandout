import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../src/utils/profilePhoto.js', import.meta.url), 'utf8').replace(/^import .*;$/gm, '').replace(/export /g, '');
const photo = new Function('process', source + '\nreturn {validatePhotoAsset,displayPhotoUrl,canonicalPhotoUrl};')({env:{EXPO_PUBLIC_FIREBASE_USE_EMULATORS:'true',EXPO_PUBLIC_FIREBASE_EMULATOR_HOST:'192.168.100.51'}});
test('photos accept JPEG and PNG bytes including original HEIC metadata', () => {
 assert.equal(photo.validatePhotoAsset({base64:'/9j/AA==',mimeType:'image/heic'}).contentType,'image/jpeg');
 assert.equal(photo.validatePhotoAsset({base64:'iVBORw0KGgo='}).extension,'png');
});
test('photos reject missing, malformed, unsupported and oversized data', () => {
 for(const base64 of [undefined,'%%%%','aGVsbG8=','/9j/'+'A'.repeat(7*1024*1024)]) assert.throws(()=>photo.validatePhotoAsset({base64}));
});
test('demo photo links remain portable and preserve download tokens', () => {
 const local='http://127.0.0.1:9199/v0/b/demo-safemeet-login.appspot.com/o/profile-photos%2Fowner%2Fphoto.jpg?alt=media&token=secret';
 const canonical=photo.canonicalPhotoUrl(local);
 assert.ok(canonical.startsWith('https://firebasestorage.googleapis.com/'));
 assert.equal(photo.displayPhotoUrl(canonical),local.replace('127.0.0.1','192.168.100.51'));
 assert.equal(photo.displayPhotoUrl('file:///preview.jpg'),'file:///preview.jpg');
 assert.throws(()=>photo.canonicalPhotoUrl('https://example.com/wrong'));
});
