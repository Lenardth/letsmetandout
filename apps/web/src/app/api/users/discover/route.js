import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const currentUserId = url.searchParams.get('userId');
    const limit = url.searchParams.get('limit') || 10;

    // Get users for discovery, excluding current user and already connected users
    const users = await sql`
      SELECT 
        u.id,
        u.name,
        u.age,
        u.avatar_url,
        u.location,
        u.bio,
        u.interests,
        COALESCE(user_groups.group_count, 0) as group_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as group_count
        FROM group_members
        GROUP BY user_id
      ) user_groups ON u.id = user_groups.user_id
      WHERE u.id != ${currentUserId || 0}
      AND u.id NOT IN (
        SELECT CASE 
          WHEN user1_id = ${currentUserId || 0} THEN user2_id 
          ELSE user1_id 
        END
        FROM user_connections 
        WHERE (user1_id = ${currentUserId || 0} OR user2_id = ${currentUserId || 0})
        AND status IN ('connected', 'pending')
      )
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      age: user.age,
      image: user.avatar_url,
      interests: user.interests || [],
      groupCount: parseInt(user.group_count || 0, 10),
      location: user.location,
      bio: user.bio,
    }));

    return Response.json(formattedUsers);

  } catch (error) {
    console.error('Error fetching discovery users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
