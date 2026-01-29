import db from '../db.js';

export function listTeamsMembers(req, res) {
  const { teamId } = req.params;
  
  // אם יש teamId - מחזיר חברי צוות
  if (teamId) {
    const members = db
      .prepare(
        `SELECT u.id, u.name, u.email
         FROM users u
         JOIN team_members tm ON tm.user_id = u.id
         WHERE tm.team_id = ?`
      )
      .all(teamId);
    return res.json(members);
  }
  
  // אחרת - מחזיר רשימת צוותים
  const teams = db
    .prepare(
      `SELECT t.*, (
         SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id
       ) as members_count
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = ?
       GROUP BY t.id`
    )
    .all(req.user.id);
  res.json(teams);
}

export function createTeam(req, res) {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = db.prepare('INSERT INTO teams (name) VALUES (?)').run(name);
  db
    .prepare('INSERT INTO team_members (team_id, user_id, role) VALUES (?,?,?)')
    .run(info.lastInsertRowid, req.user.id, 'owner');
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(team);
}

export function addMember(req, res) {
  const { teamId } = req.params;
  const { userId, role = 'member' } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const membership = db
    .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ?')
    .get(teamId, req.user.id);
  if (!membership) return res.status(403).json({ error: 'Not a team member' });
  // Note: role enforcement (owner/admin) is intentionally not applied here to match current route behavior
  db
    .prepare('INSERT OR IGNORE INTO team_members (team_id, user_id, role) VALUES (?,?,?)')
    .run(teamId, userId, role);
  res.status(204).end();
}

export function getTeamById(req, res) {
  const { id } = req.params;
  const membership = db
    .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!membership) return res.status(403).json({ error: 'Not a team member' });
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
}

export function deleteTeam(req, res) {
  const { id } = req.params;
  const membership = db
    .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!membership || membership.role !== 'owner') {
    return res.status(403).json({ error: 'Only team owner can delete the team' });
  }
  db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  res.status(204).end();
}

export function removeMember(req, res) {
  const { teamId, userId } = req.params;
  const membership = db
    .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ?')
    .get(teamId, req.user.id);
  if (!membership || membership.role !== 'owner') {
    return res.status(403).json({ error: 'Only team owner can remove members' });
  }
  db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?').run(teamId, userId);
  res.status(204).end();
}
