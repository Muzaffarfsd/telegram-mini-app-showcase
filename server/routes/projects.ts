import { Router } from "express";
import { z } from 'zod';
import { verifyTelegramUser, requireAdmin } from './shared';

const router = Router();

const userProjects = new Map<string, any[]>();

router.get("/api/user-projects/:telegramId", verifyTelegramUser, (req, res) => {
  try {
    const { telegramId } = req.params;
    if (String(req.telegramUser?.id) !== telegramId) return res.status(403).json({ error: 'Forbidden' });
    const projects = userProjects.get(telegramId) || [];
    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post("/api/create-project", verifyTelegramUser, (req, res) => {
  const projectCreateSchema = z.object({
    telegramId: z.string().regex(/^[1-9]\d{0,15}$/),
    projectName: z.string().min(1).max(255).optional(),
    projectType: z.string().max(50).optional(),
    features: z.array(z.string().max(100)).max(50).optional(),
    paymentIntentId: z.string().max(200).optional(),
  });
  
  const validationResult = projectCreateSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { telegramId, projectName, projectType, features } = validationResult.data;
    if (telegramId !== String(req.telegramUser!.id)) return res.status(403).json({ error: 'Forbidden' });
    if ((userProjects.get(telegramId)?.length || 0) >= 25) return res.status(429).json({ error: 'Project limit reached' });
    if (!userProjects.has(telegramId) && userProjects.size >= 2000) return res.status(503).json({ error: 'Project intake temporarily unavailable' });
    
    const newProject = {
      id: Date.now(),
      name: projectName || 'Новый проект',
      type: projectType || 'basic',
      status: 'Заявка',
      progress: 0,
      createdAt: new Date().toISOString(),
      features: features || [],
      telegramUserId: telegramId
    };
    
    const existingProjects = userProjects.get(telegramId) || [];
    existingProjects.push(newProject);
    userProjects.set(telegramId, existingProjects);
    
    res.json({ success: true, project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.post("/api/update-project-status", verifyTelegramUser, requireAdmin, (req, res) => {
  const projectUpdateSchema = z.object({
    telegramId: z.string().regex(/^[1-9]\d{0,15}$/),
    projectId: z.number().int().positive().safe(),
    status: z.string().max(100).optional(),
    progress: z.number().min(0).max(100).optional(),
  });
  
  const validationResult = projectUpdateSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { telegramId, projectId, status, progress } = validationResult.data;
    
    const projects = userProjects.get(telegramId) || [];
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      projects[projectIndex].status = status || projects[projectIndex].status;
      projects[projectIndex].progress = progress !== undefined ? progress : projects[projectIndex].progress;
      projects[projectIndex].updatedAt = new Date().toISOString();
      
      userProjects.set(telegramId, projects);
      
      res.json({ success: true, project: projects[projectIndex] });
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.post("/api/init-demo-projects/:telegramId", verifyTelegramUser, requireAdmin, (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
  try {
    const { telegramId } = req.params;
    if (typeof telegramId !== 'string' || !/^[1-9]\d{0,15}$/.test(telegramId) || !Number.isSafeInteger(Number(telegramId))) return res.status(400).json({ error: 'Invalid user identifier' });
    
    const demoProjects = [
      {
        id: 1001,
        name: 'Магазин одежды',
        type: 'ecommerce',
        status: 'В разработке',
        progress: 75,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['catalog', 'cart', 'payment'],
        telegramUserId: telegramId
      },
      {
        id: 1002,
        name: 'Ресторан доставки',
        type: 'restaurant',
        status: 'Готово',
        progress: 100,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['menu', 'orders', 'delivery'],
        telegramUserId: telegramId
      },
      {
        id: 1003,
        name: 'Фитнес-клуб',
        type: 'fitness',
        status: 'Планирование',
        progress: 25,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['booking', 'memberships'],
        telegramUserId: telegramId
      }
    ];
    
    userProjects.set(telegramId, demoProjects);
    
    res.json({ success: true, projects: demoProjects });
  } catch (error) {
    console.error('Error initializing demo projects:', error);
    res.status(500).json({ error: 'Failed to initialize demo projects' });
  }
});

export default router;
