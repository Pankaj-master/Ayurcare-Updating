import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export const validateRequest = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        message: error.details[0].message
      };
      res.status(400).json(response);
      return;
    }
    
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        message: error.details[0].message
      };
      res.status(400).json(response);
      return;
    }
    
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        message: error.details[0].message
      };
      res.status(400).json(response);
      return;
    }
    
    next();
  };
};

