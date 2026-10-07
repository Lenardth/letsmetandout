export function listingPayload(values, uid) {
  const text = (key) => String(values[key] || '').trim();
  const depositText = String(values.deposit_rands ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(depositText)) throw new Error('Deposit must be a rand amount with at most two decimal places.');
  const deposit = Number(depositText);
  const party = Number(values.max_party_size);
  if (!text('name') || !text('address') || !text('city') || !text('phone')) throw new Error('Add your business name, address, city and contact number.');
  if (!['Restaurant', 'Café', 'Venue'].includes(values.category)) throw new Error('Choose a business category.');
  if (!Number.isFinite(deposit) || deposit < 0 || deposit > 10000) throw new Error('Deposit must be between R0 and R10,000 per table.');
  if (!Number.isInteger(party) || party < 1 || party > 50) throw new Error('Maximum party size must be between 1 and 50.');
  if (text('image') && !/^https:\/\//.test(text('image'))) throw new Error('Use an HTTPS photo URL.');
  for (const [key, maximum] of Object.entries({ name: 150, address: 300, city: 100, phone: 30, image: 2048, description: 2000 })) if (text(key).length > maximum) throw new Error(`${key.replace(/_/g, ' ')} must be at most ${maximum} characters.`);
  return { owner_id: uid, name: text('name'), category: values.category, address: text('address'), city: text('city'), location: text('city'), phone: text('phone'), image: text('image') || null, description: text('description'), deposit_cents: Math.round(deposit * 100), max_party_size: party };
}
export function reservationPayload(store, values, uid, now = Date.now()) {
  const date = String(values.date || '').trim();
  const time = String(values.time || '').trim();
  if (!store || !Number.isInteger(store.max_party_size) || store.max_party_size < 1 || store.max_party_size > 50 || !Number.isInteger(store.deposit_cents) || store.deposit_cents < 0 || store.deposit_cents > 1000000) throw new Error('This listing has invalid booking details. Contact the business.');
  const guests = Number(values.guests);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Use a date YYYY-MM-DD and time HH:MM.');
  const stamp = Date.parse(`${date}T${time}:00+02:00`);
  if (!Number.isFinite(stamp) || new Date(stamp + 7200000).toISOString().slice(0, 10) !== date || stamp <= now) throw new Error('Choose a valid future date and time in South Africa.');
  if (!Number.isInteger(guests) || guests < 1 || guests > store.max_party_size) throw new Error(`Choose between 1 and ${store.max_party_size} guests.`);
  return { user_id: uid, store_id: store.id, title: store.name, location: store.location, booking_date: stamp, guests, deposit_cents: store.deposit_cents, payment_status: store.deposit_cents > 0 ? 'unpaid' : 'not_required', status: 'requested' };
}
