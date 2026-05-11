import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Circle, Clock, AlertCircle, Filter, Trash2, Edit2, Calendar, LayoutGrid, List } from 'lucide-react';
import Modal from '../Modal';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  dueDate: string;
}

export default function DailyTasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'urgent' | 'medium' | 'low'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const saved = localStorage.getItem('superAdminTasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('superAdminTasks', JSON.stringify(newTasks));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
    } else {
      saveTasks([{
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      }, ...tasks]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0]
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setIsModalOpen(true);
  };

  const toggleStatus = (id: string, newStatus: Task['status']) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই টাস্কটি ডিলিট করতে চান?')) {
      saveTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  }).sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={24} />;
      case 'in_progress': return <Clock className="text-blue-500" size={24} />;
      default: return <Circle className="text-gray-300 hover:text-green-400 transition-colors" size={24} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <CheckCircle className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ডেইলি টাস্ক ম্যানেজমেন্ট</h2>
            <p className="text-sm text-gray-500">নিয়মিত কাজের তালিকা এবং আপডেট</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={18} /> নতুন টাস্ক যোগ করুন
        </button>
      </div>

      {/* Filters & View Mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">স্ট্যাটাস:</span>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">সবগুলো</option>
              <option value="pending">বাকি আছে (Pending)</option>
              <option value="in_progress">চলমান (In Progress)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">প্রায়োরিটি:</span>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-sm border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="all">সবগুলো</option>
              <option value="urgent">জরুরী (Urgent)</option>
              <option value="high">হাই (High)</option>
              <option value="medium">মিডিয়াম (Medium)</option>
              <option value="low">লো (Low)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 md:hover:bg-transparent'}`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 md:hover:bg-transparent'}`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Tasks Container */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"}>
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">কোনো টাস্ক পাওয়া যায়নি</h3>
            <p className="text-gray-500">আপনার তালিকা এখন ফাঁকা। নতুন টাস্ক যোগ করুন।</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`group relative bg-white p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                task.status === 'completed' 
                  ? 'border-green-100 opacity-60 hover:opacity-100' 
                  : 'border-gray-200 shadow-sm hover:-translate-y-1'
              } ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center gap-4 py-4 px-6 hover:translate-y-0' : ''}`}
            >
              <div className={`flex justify-between items-start ${viewMode === 'list' ? 'sm:w-auto mb-0' : 'mb-4'}`}>
                <button 
                  onClick={() => toggleStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  className={`flex-shrink-0 focus:outline-none transform transition-transform hover:scale-110 ${viewMode === 'list' ? 'mt-1' : ''}`}
                  title="Mark as done/undone"
                >
                  {getStatusIcon(task.status)}
                </button>
                {viewMode === 'grid' && (
                  <div className="flex space-x-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'mb-2' : 'mb-1'}`}>
                  <h3 className={`text-lg font-bold truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {viewMode === 'list' && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                
                {task.description && (
                  <p className={`text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 ${viewMode === 'list' ? 'mb-0' : 'mb-6'}`}>
                    {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
                  </p>
                )}
              </div>
              
              <div className={`${viewMode === 'list' ? 'sm:border-l sm:border-t-0 border-t sm:pl-6 pt-4 sm:pt-0 flex sm:flex-col items-center justify-between sm:justify-center' : 'mt-auto pt-4 border-t'} border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 gap-4 sm:min-w-[120px]`}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar size={14} />
                  <span>{task.dueDate}</span>
                </div>
                
                <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity space-x-2">
                  <button 
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? 'টাস্ক এডিট করুন' : 'নতুন টাস্ক'} size="2xl">
        <form onSubmit={handleSaveTask} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">টাস্ক টাইটেল *</label>
            <input 
              type="text" 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full border-gray-300 rounded-xl p-3 border outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium" 
              placeholder="e.g. Call John regarding project presentation..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">বর্ণনা</label>
            <textarea 
              rows={4} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full border-gray-300 rounded-xl p-3 border outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              placeholder="Detailed description or notes about this task..."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">স্ট্যাটাস</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})} 
                className="w-full border-gray-300 rounded-lg p-2.5 bg-white border outline-none focus:border-indigo-500 text-sm font-medium"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">প্রায়োরিটি</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value as any})} 
                className="w-full border-gray-300 rounded-lg p-2.5 bg-white border outline-none focus:border-indigo-500 text-sm font-medium"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">ডেডলাইন</label>
              <input 
                type="date" 
                required
                value={formData.dueDate} 
                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                className="w-full border-gray-300 rounded-lg p-2.5 bg-white border outline-none focus:border-indigo-500 text-sm font-medium" 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              বাতিল
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              {editingTask ? 'আপডেট করুন' : 'সেভ করুন'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
