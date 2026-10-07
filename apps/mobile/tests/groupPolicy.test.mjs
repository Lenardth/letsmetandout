import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const code = fs.readFileSync(new URL('../src/utils/groupPolicy.js', import.meta.url), 'utf8');
const { randToCents, contributionShare, groupPayload, agreementSummary, withdrawalEstimate } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const now = Date.parse('2026-10-07T00:00:00Z');
const values = { title: 'Saturday braai', store_id: 'store1', member_ids: ['friend', 'other'], target_rands: '100.01', cancellation_cap_rands: '10', deadline_date: '2026-10-10', deadline_time: '18:00' };
test('rand amounts use exact cents and reject rounding, exponent and negative input', () => {
  assert.equal(randToCents('125.50'), 12550); assert.equal(randToCents('0.01'), 1);
  for (const value of ['', '-1', '1.001', '1e3', 'Infinity', '100001']) assert.throws(() => randToCents(value));
});
test('group proposal fixes organiser, deduplicates membership and validates future SA deadline', () => {
  const group = groupPayload({ ...values, owner_id: 'attacker', member_ids: ['friend', 'friend', 'other', 'owner'] }, 'owner', now);
  assert.equal(group.owner_id, 'owner'); assert.deepEqual(group.member_ids, ['owner', 'friend', 'other']);
  assert.equal(group.withdrawal_deadline, Date.parse('2026-10-10T16:00:00Z'));
  for (const patch of [{ member_ids: [] }, { member_ids: ['../victim'] }, { cancellation_cap_rands: '100' }, { title: 'x'.repeat(101) }, { deadline_date: '2026-02-30' }, { deadline_time: '25:00' }, { target_rands: '0' }, { member_ids: Array.from({ length: 20 }, (_, i) => 'user' + i) }]) assert.throws(() => groupPayload({ ...values, ...patch }, 'owner', now));
});
test('equal contributions preserve every cent and allocate rounding to organiser', () => {
  const group = groupPayload(values, 'owner', now);
  assert.equal(contributionShare(group, 'owner'), 3335); assert.equal(contributionShare(group, 'friend'), 3333);
  assert.equal(group.member_ids.reduce((total, id) => total + contributionShare(group, id), 0), group.target_cents);
  assert.throws(() => contributionShare(group, 'stranger'));
});
test('all members must approve; duplicate or outsider approvals cannot satisfy consent', () => {
  const group = groupPayload(values, 'owner', now);
  assert.equal(agreementSummary(group, [{ id: 'owner', status: 'approved' }, { id: 'owner', status: 'approved' }, { id: 'stranger', status: 'approved' }]).unanimous, false);
  assert.equal(agreementSummary(group, group.member_ids.map((id) => ({ id, status: 'approved' }))).unanimous, true);
  assert.equal(agreementSummary(group, group.member_ids.map((id) => ({ id, status: id === 'friend' ? 'withdrawal_requested' : 'approved' }))).unanimous, false);
});
test('withdrawal estimates protect free deadline, disclosed cap, contribution and actual costs', () => {
  const group = groupPayload(values, 'owner', now);
  assert.deepEqual(withdrawalEstimate(group, 'friend', 3333, 5000, group.withdrawal_deadline), { charge_cents: 0, refund_cents: 3333 });
  assert.deepEqual(withdrawalEstimate(group, 'friend', 3333, 5000, group.withdrawal_deadline + 1), { charge_cents: 1000, refund_cents: 2333 });
  assert.deepEqual(withdrawalEstimate(group, 'friend', 3333, 500, group.withdrawal_deadline + 1), { charge_cents: 500, refund_cents: 2833 });
  assert.deepEqual(withdrawalEstimate(group, 'friend', 200, 5000, group.withdrawal_deadline + 1), { charge_cents: 200, refund_cents: 0 });
  assert.deepEqual(withdrawalEstimate(group, 'friend', 3333, 0, group.withdrawal_deadline + 1), { charge_cents: 0, refund_cents: 3333 });
  assert.throws(() => withdrawalEstimate(group, 'friend', 9999, 5000));
  assert.throws(() => withdrawalEstimate(group, 'friend', 1.5, 5000));
});
