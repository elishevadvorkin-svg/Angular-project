import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createTeam, addMember, deleteTeam,  removeMember, listTeamsMembers } from '../controllers/teams.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTeamsMembers);

router.post('/', createTeam);

router.post('/:teamId/members', addMember);

router.get('/:teamId/members', listTeamMembers);

router.delete('/:teamId/members/:userId', removeMember);

router.delete('/:teamId', deleteTeam);

export default router;
