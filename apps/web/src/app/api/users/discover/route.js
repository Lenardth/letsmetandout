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
        COALESCE(user_groups.group_count, 0) as group_count,
        'Coffee & Photography Walk' as activity,
        150.00 as budget
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
      distance: `${(Math.random() * 4 + 0.5).toFixed(1)} km from you`,
      image: user.avatar_url,
      interests: user.interests || ['Coffee', 'Meeting new people'],
      groupSize: Math.floor(Math.random() * 4) + 2, // Random group size 2-5
      activity: generateRandomActivity(),
      location: user.location || 'Cape Town, WC',
      budget: `R${Math.floor(Math.random() * 300 + 50)}`,
    }));

    return Response.json(formattedUsers);

  } catch (error) {
    console.error('Error fetching discovery users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

function generateRandomActivity() {
  const activities = [
    'Coffee & Chat',
    'Braai & Rugby',
    'Hiking Adventure', 
    'Wine Tasting',
    'Art Gallery Visit',
    'Food Market Tour',
    'Beach Volleyball',
    'Photography Walk'
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}