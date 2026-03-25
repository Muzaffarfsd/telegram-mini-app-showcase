import { Router } from "express";
import { z } from 'zod';

const router = Router();

const userProjects = new Map<string, any[]>();

router.get("/api/user-projects/:telegramId", (req, res) => {
  try {
    const { telegramId } = req.params;
    const projects = userProjects.get(telegramId) || [];
    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post("/api/create-project", (req, res) => {
  const projectCreateSchema = z.object({
    telegramId: z.string().min(1),
    projectName: z.string().min(1).max(255).optional(),
    projectType: z.string().max(50).optional(),
    features: z.array(z.string()).optional(),
    paymentIntentId: z.string().optional(),
  });
  
  const validationResult = projectCreateSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { telegramId, projectName, projectType, features, paymentIntentId } = validationResult.data;
    
    const newProject = {
      id: Date.now(),
      name: projectName || 'Новый проект',
      type: projectType || 'basic',
      status: 'Оплачено',
      progress: 10,
      createdAt: new Date().toISOString(),
      features: features || [],
      paymentIntentId,
      telegramUserId: telegramId
    };
    
    const existingProjects = userProjects.get(telegramId) || [];
    existingProjects.push(newProject);
    userProjects.set(telegramId, existingProjects);
    
    console.log(`Created project for user ${telegramId}:`, projectName);
    res.json({ success: true, project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.post("/api/update-project-status", (req, res) => {
  const projectUpdateSchema = z.object({
    telegramId: z.string().min(1),
    projectId: z.number(),
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

router.post("/api/init-demo-projects/:telegramId", (req, res) => {
  try {
    const { telegramId } = req.params;
    
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
