// Shared planning calculations. These never debit a wallet or authorize a payment.
export function randToCents(value, label = 'Amount') {
  const text = String(value ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new Error(`${label} must be a rand amount with at most two decimal places.`);
  const [rands, cents = ''] = text.split('.');
  const amount = Number(rands) * 100 + Number(cents.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 10000000) throw new Error(`${label} must be between R0 and R100,000.`);
  return amount;
}
export function contributionShare(group, uid) {
  if (!group.member_ids.includes(uid)) throw new Error('You are not a member of this group.');
  const base = Math.floor(group.target_cents / group.member_ids.length);
  return base + (uid === group.owner_id ? group.target_cents % group.member_ids.length : 0);
}
export function groupPayload(values, uid, now = Date.now()) {
  const title = String(values.title || '').trim();
  const storeId = String(values.store_id || '').trim();
  const members = [...new Set([uid, ...(values.member_ids || []).filter((id) => id !== '')])];
  if (!title || title.length > 100) throw new Error('Give your get-together a name of up to 100 characters.');
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(storeId)) throw new Error('Choose a place for your get-together.');
  if (members.length < 2 || members.length > 20 || members.some((id) => typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id))) throw new Error('Choose between 2 and 20 members, including yourself.');
  const target = randToCents(values.target_rands, 'Group budget');
  const cap = randToCents(values.cancellation_cap_rands, 'Withdrawal charge cap');
  if (target < members.length) throw new Error('The budget must cover at least one cent per member.');
  if (cap > Math.floor(target / members.length)) throw new Error('The withdrawal charge cap cannot exceed the smallest member contribution.');
  const deadline = Date.parse(`${values.deadline_date}T${values.deadline_time}:00+02:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.deadline_date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.deadline_time || '') || !Number.isSafeInteger(deadline) || deadline <= now || new Date(deadline + 7200000).toISOString().slice(0, 10) !== values.deadline_date) throw new Error('Choose a valid future withdrawal deadline in South African time.');
  return { owner_id: uid, title, store_id: storeId, member_ids: members, target_cents: target, cancellation_cap_cents: cap, withdrawal_deadline: deadline, policy_version: 1 };
}
export function agreementSummary(group, agreements) {
  const approved = group.member_ids.filter((uid) => agreements.some((item) => item.id === uid && item.status === 'approved')).length;
  return { approved, total: group.member_ids.length, unanimous: approved === group.member_ids.length };
}
export function withdrawalEstimate(group, uid, confirmedContributionCents, unrecoverableCostCents, now = Date.now()) {
  const share = contributionShare(group, uid);
  for (const amount of [confirmedContributionCents, unrecoverableCostCents]) if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('Use non-negative integer cents.');
  if (confirmedContributionCents > share) throw new Error('Contribution exceeds the agreed share.');
  const charge = now <= group.withdrawal_deadline ? 0 : Math.min(group.cancellation_cap_cents, unrecoverableCostCents, confirmedContributionCents, share);
  return { charge_cents: charge, refund_cents: confirmedContributionCents - charge };
}
