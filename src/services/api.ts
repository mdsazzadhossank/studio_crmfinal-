import { API_BASE_URL, USE_MOCK_FALLBACK } from '../config';
import { Client, Model, Content, ScheduleEvent, Project, Invoice } from '../data/mockData';

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      let errorMsg = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMsg += ` - ${errorData.error}`;
        }
      } catch (e) {
        // Ignore JSON parse error if response is not JSON
      }
      throw new Error(errorMsg);
    }
    
    return await response.json();
  } catch (error) {
    if (!USE_MOCK_FALLBACK) {
      console.error(`API Call failed for ${endpoint}:`, error);
    }
    throw error;
  }
}

export const api = {
  // GET Requests (আপনার PHP ফাইলগুলো ডাটাবেজ থেকে ডাটা এনে JSON ফরম্যাটে রিটার্ন করবে)
  getClients: () => fetchApi<Client[]>('/get_clients'),
  getModels: () => fetchApi<Model[]>('/get_models'),
  getContent: () => fetchApi<Content[]>('/get_content'),
  getSchedule: () => fetchApi<ScheduleEvent[]>('/get_schedule'),
  getCategories: () => fetchApi<string[]>('/get_categories'),
  getInvoices: () => fetchApi<Invoice[]>('/get_invoices'),
  getDailyTasks: () => fetchApi<any>('/get_daily_tasks'),
  
  // Backup endpoints
  getBackupHistory: () => fetchApi<any[]>('/backup/history'),
  runBackup: () => fetchApi<{success: boolean, message?: string, drive_url?: string, backup_size?: string, error?: string}>('/backup/run', { method: 'POST' }),

  // POST Requests (আপনার PHP ফাইলগুলো JSON ডাটা রিসিভ করে ডাটাবেজে সেভ করবে)
  addClient: (data: Omit<Client, 'id' | 'projects'>) => 
    fetchApi<Client>('/add_client', { method: 'POST', body: JSON.stringify(data) }),
    
  addProject: (clientId: string, data: Omit<Project, 'id'>) => 
    fetchApi<Project>('/add_project', { method: 'POST', body: JSON.stringify({ clientId, ...data }) }),
    
  updateProject: (clientId: string, projectId: string, data: Partial<Project>, newClientId?: string) => 
    fetchApi<Project>('/update_project', { method: 'POST', body: JSON.stringify({ clientId, projectId, newClientId, ...data }) }),
    
  addModel: (data: Omit<Model, 'id'>) => 
    fetchApi<Model>('/add_model', { method: 'POST', body: JSON.stringify(data) }),
    
  addContent: (data: Omit<Content, 'id'>) => 
    fetchApi<Content>('/add_content', { method: 'POST', body: JSON.stringify(data) }),
    
  addScheduleEvent: (data: Omit<ScheduleEvent, 'id'>) => 
    fetchApi<ScheduleEvent>('/add_schedule', { method: 'POST', body: JSON.stringify(data) }),
    
  addCategory: (category: string) => 
    fetchApi<{success: boolean}>('/add_category', { method: 'POST', body: JSON.stringify({ category }) }),
    
  addInvoice: (data: Omit<Invoice, 'id'>) => 
    fetchApi<Invoice>('/add_invoice', { method: 'POST', body: JSON.stringify(data) }),
    
  deleteInvoice: (id: string) => 
    fetchApi<{success: boolean}>('/delete_invoice', { method: 'POST', body: JSON.stringify({ id }) }),
    
  saveDailyTask: (date_key: string, step_id: string, completed: boolean, notes: string) => 
    fetchApi<{success: boolean}>('/save_daily_task', { method: 'POST', body: JSON.stringify({ date_key, step_id, completed, notes }) }),
};
