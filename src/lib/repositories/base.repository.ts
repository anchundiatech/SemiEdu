import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

export abstract class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected get table() {
    return supabase.from(this.tableName);
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.table
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error finding ${this.tableName} by id:`, error);
      return null;
    }

    return data as T;
  }

  async findAll(): Promise<T[]> {
    const { data, error } = await this.table.select('*');

    if (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      return [];
    }

    return data as T[];
  }

  async create(item: Partial<T>): Promise<T | null> {
    const { data, error } = await this.table
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return null;
    }

    return data as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const { data, error } = await this.table
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return null;
    }

    return data as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.table
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return false;
    }

    return true;
  }

  async count(): Promise<number> {
    const { count, error } = await this.table
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      return 0;
    }

    return count || 0;
  }
}

export interface RepositoryResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class RepositoryError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}
