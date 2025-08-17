import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const filter = url.searchParams.get('filter') || 'all';

    let query = `
      SELECT 
        g.id,
        g.name,
        g.activity,
        g.category,
        g.max_members,
        g.location,
        g.budget_per_person,
        g.status,
        u.name as host_name,
        u.avatar_url as host_avatar,
        COUNT(gm.user_id) as member_count,
        ARRAY_AGG(u2.avatar_url) as member_avatars,
        mp.planned_date as next_meetup_date
      FROM groups g
      LEFT JOIN users u ON g.host_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN users u2 ON gm.user_id = u2.id
      LEFT JOIN meetup_plans mp ON g.id = mp.group_id AND mp.status IN ('confirmed', 'pending')
      WHERE 1=1
    `;

    const params = [];
    
    if (filter === 'my-groups' && userId) {
      query += ` AND g.id IN (SELECT group_id FROM group_members WHERE user_id = $${params.length + 1})`;
      params.push(userId);
    } else if (filter === 'active') {
      query += ` AND g.status = 'active'`;
    } else if (filter === 'available') {
      query += ` AND g.status = 'active'`;
    }

    query += `
      GROUP BY g.id, g.name, g.activity, g.category, g.max_members, g.location, 
               g.budget_per_person, g.status, u.name, u.avatar_url, mp.planned_date
      ORDER BY g.created_at DESC
    `;

    const groups = await sql(query, params);

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      activity: group.activity,
      category: group.category,
      members: parseInt(group.member_count),
      maxMembers: group.max_members,
      nextMeetup: formatNextMeetup(group.next_meetup_date),
      location: group.location,
      budget: `R${parseFloat(group.budget_per_person).toFixed(0)}`,
      host: {
        name: group.host_name,
        avatar: group.host_avatar
      },
      memberAvatars: (group.member_avatars || []).filter(Boolean).slice(0, 5),
      status: group.status
    }));

    return Response.json(formattedGroups);

  } catch (error) {
    console.error('Error fetching groups:', error);
    return Response.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

function formatNextMeetup(date) {
  if (!date) return 'No upcoming meetup';
  
  const meetupDate = new Date(date);
  const now = new Date();
  const diffInDays = Math.ceil((meetupDate - now) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow, 2:00 PM';
  } else if (diffInDays <= 7) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[meetupDate.getDay()]}, ${meetupDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else {
    return meetupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}