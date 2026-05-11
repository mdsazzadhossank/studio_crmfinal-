import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Target, AlertTriangle, 
  BarChart as BarChartIcon, Activity, Edit2
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, Line
} from 'recharts';
import Modal from '../Modal';

const defaultGoals = [
  { id: 'fb', title: 'Facebook Ads', target: 500000, current: 0, clientsSigned: 0, targetClients: 20, colorClass: 'bg-blue-500', colorLightClass: 'bg-blue-400' },
  { id: 'web', title: 'Web Dev', target: 800000, current: 0, clientsSigned: 0, targetClients: 5, colorClass: 'bg-indigo-500', colorLightClass: 'bg-indigo-400' },
  { id: 'lp', title: 'Landing Page', target: 200000, current: 0, clientsSigned: 0, targetClients: 15, colorClass: 'bg-emerald-500', colorLightClass: 'bg-emerald-400' },
  { id: 'consult', title: 'Consultancy', target: 150000, current: 0, clientsSigned: 0, targetClients: 10, colorClass: 'bg-amber-500', colorLightClass: 'bg-amber-400' },
];

export default function SuperAdminDashboardView() {
  const [goals, setGoals] = useState(defaultGoals);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [vipClients, setVipClients] = useState<any[]>([]);
  const [generalClients, setGeneralClients] = useState<any[]>([]);

  // Financial data from AgencyProfit
  const [grossProfit, setGrossProfit] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [officeExpTotal, setOfficeExpTotal] = useState(0);
  const [usdRates, setUsdRates] = useState({ buyRate: 130, chargeRate: 145 });
  const [profitChartData, setProfitChartData] = useState<any[]>([]);

  useEffect(() => {
    // Goals
    const savedGoals = localStorage.getItem('monthlyGoals');
    if (savedGoals) { try { setGoals(JSON.parse(savedGoals)); } catch {} }

    // VIP Clients
    const savedVips = localStorage.getItem('vipClientsData');
    if (savedVips) { try { setVipClients(JSON.parse(savedVips)); } catch {} }

    // General Clients (correct key)
    const savedGeneral = localStorage.getItem('allClientsData');
    if (savedGeneral) { try { setGeneralClients(JSON.parse(savedGeneral)); } catch {} }

    // Profit Injections
    let gross = 0;
    const savedInj = localStorage.getItem('sa_profit_injections');
    if (savedInj) {
      try {
        const inj = JSON.parse(savedInj);
        gross = inj.reduce((s: number, i: any) => s + (i.amount || 0), 0);
        // Build chart data
        const chart = inj.slice().reverse().reduce((acc: any[], item: any) => {
          const day = item.date?.split('-').pop() || '?';
          const ex = acc.find((d: any) => d.day === day);
          if (ex) ex.profit += item.amount; else acc.push({ day, profit: item.amount });
          return acc;
        }, []).slice(-7);
        setProfitChartData(chart);
      } catch {}
    }
    setGrossProfit(gross);

    // Office Expenses
    let offExp = 0;
    const savedExp = localStorage.getItem('sa_office_expenses');
    if (savedExp) { try { offExp = JSON.parse(savedExp).reduce((s: number, e: any) => s + (e.amount || 0), 0); } catch {} }
    setOfficeExpTotal(offExp);

    // Employee Payroll
    let payroll = 0;
    const savedEmp = localStorage.getItem('sa_employees');
    if (savedEmp) { try { payroll = JSON.parse(savedEmp).reduce((s: number, e: any) => s + (e.baseSalary || 0), 0); } catch {} }
    setTotalPayroll(payroll);

    const totalExp = offExp + payroll;
    setTotalExpenses(totalExp);
    setNetProfit(gross - totalExp);

    // USD Rates
    const savedRates = localStorage.getItem('sa_usd_rates');
    if (savedRates) { try { setUsdRates(JSON.parse(savedRates)); } catch {} }
  }, []);

  // Dynamic low balance alerts (VIP clients with balance < 5000)
  const lowBalanceClients = vipClients.filter(c => c.status === 'active' && c.balance > 0 && c.balance < 5000);

  const allClientsWithReminders = [...vipClients, ...generalClients].filter(c => c.reminder || (c.updateNote && c.updateNote.trim() !== ''));

  const saveGoals = (newGoals: any) => {
    setGoals(newGoals);
    localStorage.setItem('monthlyGoals', JSON.stringify(newGoals));
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const newGoals = goals.map((g: any) => g.id === editingGoal.id ? editingGoal : g);
    saveGoals(newGoals);
    setEditingGoal(null);
  };

  // Currency arbitrage calc
  const arbitragePerDollar = usdRates.chargeRate - usdRates.buyRate;

  return (
    <div className="space-y-6">
      {/* Low Balance Alerts */}
      {lowBalanceClients.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm mb-6">
          <div className="flex items-center text-red-800 font-bold mb-2">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Low Balance Alerts ({lowBalanceClients.length} clients)
          </div>
          <div className="space-y-1">
            {lowBalanceClients.map((client: any) => (
              <div key={client.id} className="text-sm text-red-700">
                <span className="font-semibold">{client.name}</span> has a balance of ৳{client.balance.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={64} className="text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Gross Revenue</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                <p className="text-2xl font-black text-gray-800">৳{grossProfit.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Expenses</p>
                <p className="text-2xl font-black text-red-500">৳{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${grossProfit > 0 ? Math.min(100, (totalExpenses / grossProfit) * 100) : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={64} className="text-green-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Net Profit</h3>
            <p className="text-3xl font-black text-gray-800 mb-1">৳{netProfit.toLocaleString()}</p>
            <div className="text-xs text-gray-500 space-y-0.5 mt-2">
              <p>Office: ৳{officeExpTotal.toLocaleString()}</p>
              <p>Payroll: ৳{totalPayroll.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-sm p-6 relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign size={64} className="text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">USD Rate Margin</h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Buy Rate</p>
                <p className="text-2xl font-black text-white">৳{usdRates.buyRate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Charge Rate</p>
                <p className="text-2xl font-black text-amber-500">৳{usdRates.chargeRate}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">Margin: <span className="text-amber-400 font-bold">৳{arbitragePerDollar}/USD</span></p>
          </div>
        </div>

        {/* VIP Reminders Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 flex flex-col h-full xl:row-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-indigo-500 h-5 w-5" /> 
            Client Reminders & Updates
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {allClientsWithReminders.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No particular reminders at the moment.</p>
            ) : (
              allClientsWithReminders.map((client: any) => (
                <div key={client.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">{client.name}</h4>
                    {client.lastUpdate && <span className="text-[10px] text-gray-400">{new Date(client.lastUpdate).toLocaleDateString()}</span>}
                  </div>
                  {client.reminder && (
                    <div className="mb-2">
                      <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded mr-2 mb-1">Action</span>
                      <p className="text-xs text-gray-700 font-medium">{client.reminder}</p>
                    </div>
                  )}
                  {client.updateNote && (
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded mr-2 mb-1">Last Talk</span>
                      <p className="text-xs text-gray-600 italic">"{client.updateNote}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            <Target className="mr-2 text-indigo-500" /> Agency Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">VIP Clients</p>
              <p className="text-xl font-black text-gray-900">{vipClients.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Total Clients</p>
              <p className="text-xl font-black text-gray-900">{vipClients.length + generalClients.length}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-500">Monthly Net Profit (BDT)</span>
              <span className="text-2xl font-black text-gray-900">৳{netProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">Approx. in USD</span>
              <span className="text-xl font-black text-green-600">${usdRates.chargeRate > 0 ? (netProfit / usdRates.chargeRate).toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            <BarChartIcon className="mr-2 text-blue-500" /> Profit Trend
          </h3>
          {profitChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Agency Profit ট্যাবে ডাটা যোগ করলে এখানে চার্ট দেখা যাবে।
            </div>
          ) : (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Profit (৳)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Goal Tracker */}
      <div>
        <h3 className="text-xl font-extrabold text-gray-800 mb-6">Monthly Goal Tracker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {goals.map((goal: any, idx: number) => (
            <div key={goal.id || idx} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative">
              <button 
                onClick={() => setEditingGoal(goal)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
                title="লক্ষ্য আপডেট করুন"
              >
                <Edit2 size={16} />
              </button>
              <h4 className="text-sm font-bold text-gray-600 mb-4 pr-8">{goal.title}</h4>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-500">Revenue</span>
                  <span className="font-bold text-gray-900">৳{Number(goal.current).toLocaleString()} / ৳{Number(goal.target).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${goal.current >= goal.target ? 'bg-green-500' : goal.colorClass}`} 
                    style={{ width: `${Math.min(100, goal.target > 0 ? (goal.current / goal.target) * 100 : 0)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-500">Clients Signed</span>
                  <span className="font-bold text-gray-900">{goal.clientsSigned} / {goal.targetClients}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${goal.clientsSigned >= goal.targetClients ? 'bg-green-400' : goal.colorLightClass}`} 
                    style={{ width: `${Math.min(100, goal.targetClients > 0 ? (goal.clientsSigned / goal.targetClients) * 100 : 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!editingGoal} onClose={() => setEditingGoal(null)} title={`${editingGoal?.title} - লক্ষ্য পরিবর্তন`}>
        {editingGoal && (
          <form onSubmit={handleUpdateGoal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বর্তমান রেভিনিউ (Current)</label>
                <input type="number" required value={editingGoal.current} onChange={e => setEditingGoal({...editingGoal, current: Number(e.target.value)})} className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">রেভিনিউ টার্গেট (Target)</label>
                <input type="number" required value={editingGoal.target} onChange={e => setEditingGoal({...editingGoal, target: Number(e.target.value)})} className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বর্তমান ক্লায়েন্ট (Signed)</label>
                <input type="number" required value={editingGoal.clientsSigned} onChange={e => setEditingGoal({...editingGoal, clientsSigned: Number(e.target.value)})} className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ক্লায়েন্ট টার্গেট (Target Clients)</label>
                <input type="number" required value={editingGoal.targetClients} onChange={e => setEditingGoal({...editingGoal, targetClients: Number(e.target.value)})} className="w-full border-gray-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border bg-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setEditingGoal(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">বাতিল</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-transform transform hover:-translate-y-0.5">সেভ করুন</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
