import test from 'node:test';
import fs from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { ref, uploadBytes, getMetadata, deleteObject, updateMetadata } from 'firebase/storage';
test('profile photo storage enforces ownership, verification, type, size and safe replacements', async () => {
 const env=await initializeTestEnvironment({projectId:'demo-safemeet-photos',storage:{host:'127.0.0.1',port:9199,rules:fs.readFileSync('firebase/storage.rules','utf8')}});
 try {
 await env.clearStorage();
 const owner=env.authenticatedContext('owner',{email_verified:true}).storage();
 const other=env.authenticatedContext('other',{email_verified:true}).storage();
 const unverified=env.authenticatedContext('owner',{email_verified:false}).storage();
 const anonymous=env.unauthenticatedContext().storage();
 const path='profile-photos/owner/photo.jpg';
 const bytes=new Uint8Array([255,216,255,0]);
 const upload=(storage,p=path,data=bytes,type='image/jpeg')=>uploadBytes(ref(storage,p),data,{contentType:type});
 await assertFails(upload(anonymous));
 await assertFails(upload(unverified));
 await assertFails(upload(other));
 await assertFails(upload(owner,'profile-photos/owner/bad.html',bytes,'text/html'));
 await assertFails(upload(owner,'profile-photos/owner/big.jpg',new Uint8Array(5*1024*1024+1)));
 await assertFails(upload(owner,'profile-photos/owner/empty.jpg',new Uint8Array()));
 await assertFails(upload(owner,'elsewhere/photo.jpg'));
 await assertSucceeds(upload(owner));
 await assertSucceeds(getMetadata(ref(other,path)));
 await assertFails(getMetadata(ref(anonymous,path)));
 await assertSucceeds(upload(owner,path,new Uint8Array([255,216,255,1])));
 await assertFails(updateMetadata(ref(owner,path),{contentType:'text/html'}));
 await assertFails(deleteObject(ref(other,path)));
 await assertSucceeds(deleteObject(ref(owner,path)));
 } finally {await env.cleanup();}
});
