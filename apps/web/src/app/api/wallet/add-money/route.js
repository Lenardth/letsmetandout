import sql from '@/app/api/utils/sql';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, amount } = body;

    if (!userId || !amount) {
      return Response.json({ error: 'User ID and amount are required' }, { status: 400 });
    }

    if (amount <= 0) {
      return Response.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const [transactionResult, userResult] = await sql.transaction([
      sql`
        INSERT INTO wallet_transactions (user_id, amount, transaction_type, description, status)
        VALUES (${userId}, ${amount}, 'deposit', 'Added Money', 'completed')
        RETURNING *
      `,
      sql`
        UPDATE users 
        SET wallet_balance = wallet_balance + ${amount}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING wallet_balance
      `
    ]);

    if (userResult.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      transaction: {
        id: transactionResult[0].id,
        amount: parseFloat(transactionResult[0].amount),
        description: transactionResult[0].description,
        createdAt: transactionResult[0].created_at
      },
      newBalance: parseFloat(userResult[0].wallet_balance)
    });

  } catch (error) {
    console.error('Error adding money to wallet:', error);
    return Response.json({ error: 'Failed to add money to wallet' }, { status: 500 });
  }
}