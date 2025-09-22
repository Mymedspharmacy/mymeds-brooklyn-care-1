// Base Repository Implementation
// Clean Architecture: Infrastructure Layer

import { PrismaClient } from '@prisma/client';
import { IRepository } from '../../core/interfaces/IRepository';

export abstract class BaseRepository<T, ID = number> implements IRepository<T, ID> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  async findById(id: ID): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id }
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to find ${this.modelName} by id: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const results = await (this.prisma as any)[this.modelName].findMany({
        orderBy: { createdAt: 'desc' }
      });
      return results;
    } catch (error) {
      throw new Error(`Failed to find all ${this.modelName}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({
        data: entity
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to create ${this.modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: ID, entity: Partial<T>): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data: entity
      });
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return null;
      }
      throw new Error(`Failed to update ${this.modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      await (this.prisma as any)[this.modelName].delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return false;
      }
      throw new Error(`Failed to delete ${this.modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<number> {
    try {
      const count = await (this.prisma as any)[this.modelName].count();
      return count;
    } catch (error) {
      throw new Error(`Failed to count ${this.modelName}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
