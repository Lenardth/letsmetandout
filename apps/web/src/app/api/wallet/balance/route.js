import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const result = await sql`
      SELECT wallet_balance, 
             (SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions 
              WHERE user_id = ${userId} AND status = 'pending' AND amount < 0) as pending_expenses,
             (SELECT COALESCE(SUM(ABS(amount)), 0) FROM wallet_transactions 
              WHERE user_id = ${userId} AND transaction_type = 'expense' 
              AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)) as monthly_spent
      FROM users 
      WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result[0];
    
    return Response.json({
      balance: parseFloat(user.wallet_balance),
      pendingRedemptions: Math.abs(parseFloat(user.pending_expenses || 0)),
      monthlySpent: parseFloat(user.monthly_spent || 0),
      monthlyBudget: 1500.00 // Could be stored in user preferences
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return Response.json({ error: 'Failed to fetch wallet balance' }, { status: 500 });
  }
}