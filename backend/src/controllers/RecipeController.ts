import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class RecipeController {
  async getAllRecipes(req: Request, res: Response): Promise<void> {
    try {
      const recipes = await prisma.recipe.findMany({
        where: { isActive: true },
        include: { items: { include: { food: true } } },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Recipes retrieved successfully',
        data: recipes
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async createRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { items, ...recipeData } = req.body;
      
      const recipe = await prisma.recipe.create({
        data: {
          ...recipeData,
          items: {
            create: items
          }
        },
        include: { items: { include: { food: true } } }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Recipe created successfully',
        data: recipe
      };

      res.status(201).json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error creating recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getRecipeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: { items: { include: { food: true } } }
      });

      if (!recipe) {
        const response: ApiResponse = {
          success: false,
          message: 'Recipe not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Recipe retrieved successfully',
        data: recipe
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async updateRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const recipe = await prisma.recipe.update({
        where: { id },
        data: updateData
      });

      const response: ApiResponse = {
        success: true,
        message: 'Recipe updated successfully',
        data: recipe
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error updating recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async deleteRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.recipe.update({
        where: { id },
        data: { isActive: false }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Recipe deleted successfully'
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error deleting recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }

  async getRecipesByDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const { difficulty } = req.params;
      const recipes = await prisma.recipe.findMany({
        where: { difficulty, isActive: true },
        include: { items: { include: { food: true } } },
        orderBy: { createdAt: 'desc' }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Recipes retrieved successfully',
        data: recipes
      };

      res.json(response);
      return;
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Error retrieving recipes by difficulty',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
      return;
    }
  }
}