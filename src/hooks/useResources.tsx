import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ResourceType = 'pdf' | 'video' | 'image' | 'audio' | 'note' | 'archive' | 'software' | 'code' | 'other';
export type SortOption = 'newest' | 'oldest' | 'name' | 'size';

export interface Resource {
  id: string;
  title: string;
  file_key: string;
  folder_id: string | null;
  course_id: string | null;
  owner_id: string;
  type: ResourceType;
  mime_type: string;
  size: number;
  checksum: string | null;
  tags: string[];
  description: string | null;
  semester: string | null;
  year: string | null;
  visibility: 'private' | 'shared' | 'public';
  download_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  course?: {
    id: string;
    name: string;
    code: string | null;
    color: string;
  } | null;
  folder?: {
    id: string;
    name: string;
  } | null;
}

export interface Course {
  id: string;
  name: string;
  code: string | null;
  color: string;
}

interface UseResourcesOptions {
  search?: string;
  type?: ResourceType | 'all';
  courseId?: string | 'all';
  sortBy?: SortOption;
  folderId?: string | null;
}

export function useResources(options: UseResourcesOptions = {}) {
  const { search = '', type = 'all', courseId = 'all', sortBy = 'newest', folderId } = options;

  return useQuery({
    queryKey: ['resources', search, type, courseId, sortBy, folderId],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          course:courses(id, name, code, color),
          folder:folders(id, name)
        `);

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply type filter
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }

      // Apply course filter
      if (courseId && courseId !== 'all') {
        query = query.eq('course_id', courseId);
      }

      // Apply folder filter
      if (folderId !== undefined) {
        if (folderId === null) {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', folderId);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'name':
          query = query.order('title', { ascending: true });
          break;
        case 'size':
          query = query.order('size', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code, color')
        .order('name');

      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('resource_id');

      if (error) throw error;
      return data.map(f => f.resource_id);
    },
  });
}

export async function toggleFavorite(resourceId: string, isFavorite: boolean) {
  if (isFavorite) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('resource_id', resourceId);
    if (error) throw error;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, resource_id: resourceId });
    if (error) throw error;
  }
}

export async function incrementDownloadCount(resourceId: string) {
  const { data: resource } = await supabase
    .from('resources')
    .select('download_count')
    .eq('id', resourceId)
    .single();
  
  if (resource) {
    await supabase
      .from('resources')
      .update({ download_count: (resource.download_count || 0) + 1 })
      .eq('id', resourceId);
  }
}
