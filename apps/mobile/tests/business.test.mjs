import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const text = fs.readFileSync(new URL('../src/utils/businessValidation.js', import.meta.url), 'utf8');
const { listingPayload, reservationPayload } = await import('data:text/javascript;base64,' + Buffer.from(text).toString('base64'));
const listing = { name: 'Cafe', category: 'Café', city: 'Johannesburg', address: '1 Main Road', phone: '0111234567', image: '', description: 'Coffee', deposit_rands: '125.50', max_party_size: '8' };
test('listing fixes owner and converts rand to integer cents', () => { const value = listingPayload({ ...listing, owner_id: 'victim' }, 'merchant'); assert.equal(value.owner_id, 'merchant'); assert.equal(value.deposit_cents, 12550); assert.throws(() => listingPayload({ ...listing, deposit_rands: '-1' }, 'merchant')); });
test('reservation validates SA local dates, party size and never claims payment', () => {
 const store = { id: 'store1', name: 'Cafe', location: 'Johannesburg', max_party_size: 8, deposit_cents: 12550 };
 const value = reservationPayload(store, { date: '2026-10-20', time: '18:00', guests: '2', payment_status: 'paid' }, 'customer', Date.parse('2026-10-05T00:00:00Z'));
 assert.equal(value.booking_date, Date.parse('2026-10-20T16:00:00Z')); assert.equal(value.payment_status, 'unpaid'); assert.equal(value.status, 'requested');
 assert.throws(() => reservationPayload(store, { date: '2026-02-30', time: '18:00', guests: '2' }, 'customer', 0));
 assert.throws(() => reservationPayload(store, { date: '2026-10-20', time: '18:00', guests: '9' }, 'customer', 0));
});

test('listing validates decimal precision and Firestore field limits before writing', () => {
  for (const patch of [{ deposit_rands: '1.001' }, { deposit_rands: '1e2' }, { name: 'x'.repeat(151) }, { city: 'x'.repeat(101) }, { description: 'x'.repeat(2001) }, { image: 'http://example.com/photo' }]) assert.throws(() => listingPayload({ ...listing, ...patch }, 'merchant'));
});
