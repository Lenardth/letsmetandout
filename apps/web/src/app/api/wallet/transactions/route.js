import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const limit = url.searchParams.get('limit') || 10;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transactions = await sql`
      SELECT 
        wt.id,
        wt.amount,
        wt.transaction_type,
        wt.description,
        wt.status,
        wt.created_at,
        g.name as group_name,
        mp.title as plan_title,
        pp.user_id
      FROM wallet_transactions wt
      LEFT JOIN groups g ON wt.group_id = g.id
      LEFT JOIN meetup_plans mp ON wt.plan_id = mp.id
      LEFT JOIN plan_participants pp ON wt.plan_id = pp.plan_id
      WHERE wt.user_id = ${userId}
      ORDER BY wt.created_at DESC
      LIMIT ${limit}
    `;

    // Count participants for group transactions
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        let participants = null;
        
        if (transaction.plan_id) {
          const participantCount = await sql`
            SELECT COUNT(*) as count 
            FROM plan_participants 
            WHERE plan_id = ${transaction.plan_id}
          `;
          participants = parseInt(participantCount[0]?.count || 0);
        }

        return {
          id: transaction.id,
          type: transaction.transaction_type === 'deposit' ? 'income' : 'expense',
          title: transaction.plan_title || transaction.description,
          groupName: transaction.group_name,
          amount: Math.abs(parseFloat(transaction.amount)),
          date: formatRelativeTime(transaction.created_at),
          status: transaction.status,
          participants
        };
      })
    );

    return Response.json(formattedTransactions);

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

function formatRelativeTime(date) {
  const now = new Date();
  const transactionDate = new Date(date);
  const diffInHours = Math.floor((now - transactionDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}