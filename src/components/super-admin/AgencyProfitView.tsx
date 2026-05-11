import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Plus, Save, TrendingUp, MinusCircle, Trash2 } from 'lucide-react';

const mockProfitVelocity = [
  { day: '01', profit: 12000 },
  { day: '02', profit: 15000 },
  { day: '03', profit: 8000 },
  { day: '04', profit: 22000 },
  { day: '05', profit: 18000 },
  { day: '06', profit: 9000 },
  { day: '07', profit: 25000 },
  { day: '08', profit: 28000 },
  { day: '09', profit: 15000 },
  { day: '10', profit: 32000 },
  { day: '11', profit: 14000 },
  { day: '12', profit: 16000 },
  { day: '13', profit: 21000 },
  { day: '14', profit: 19000 },
  { day: '15', profit: 35000 },
];

export default function AgencyProfitView() {
  const [injectionForm, setInjectionForm] = useState({
    date: '',
    segment: '',
    amount: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    date: '',
    description: '',
    amount: ''
  });

  const [officeExpenses, setOfficeExpenses] = useState([
    { id: 1, date: '2026-05-01', description: 'Office Rent & Utilities', amount: 15000 },
    { id: 2, date: '2026-05-05', description: 'Internet Bill', amount: 2000 },
    { id: 3, date: '2026-05-08', description: 'Snacks & Others', amount: 3500 },
  ]);

  const [usdRates, setUsdRates] = useState({
    buyRate: 130,
    chargeRate: 145
  });
  const [isEditingRates, setIsEditingRates] = useState(false);

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profit Injected", injectionForm);
    alert("Profit record added manually.");
    setInjectionForm({ date: '', segment: '', amount: '' });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.date || !expenseForm.description || !expenseForm.amount) return;
    
    setOfficeExpenses([
      ...officeExpenses,
      {
        id: Date.now(),
        date: expenseForm.date,
        description: expenseForm.description,
        amount: Number(expenseForm.amount)
      }
    ]);
    setExpenseForm({ date: '', description: '', amount: '' });
  };

  const handleDeleteExpense = (id: number) => {
    setOfficeExpenses(officeExpenses.filter(exp => exp.id !== id));
  };

  const baseProfit = 425500;
  const totalOfficeExpense = officeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfitMonthly = baseProfit - totalOfficeExpense;

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-indigo-600 rounded-2xl shadow-sm border border-indigo-700 p-6 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign size={64} />
          </div>
          <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-2">Total Net Profit</h3>
          <p className="text-3xl font-black mb-1">৳{netProfitMonthly.toLocaleString()}</p>
          <p className="text-sm font-medium text-indigo-200">After ৳{totalOfficeExpense.toLocaleString()} deduction</p>
        </div>

        <div className="bg-emerald-500 rounded-2xl shadow-sm border border-emerald-600 p-6 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp size={64} />
          </div>
          <h3 className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-2">Today's Profit</h3>
          <p className="text-3xl font-black mb-1">৳35,000</p>
          <p className="text-sm font-medium text-emerald-100">Target: <span className="font-bold text-white">৳40,000</span></p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Gross Profit (Before Exp)</h3>
          <p className="text-2xl font-black text-gray-900 mb-1">৳{baseProfit.toLocaleString()}</p>
          <div className="flex items-center text-sm font-medium text-green-600">
            <TrendingUp size={16} className="mr-1" /> Top-line Revenue
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Office Expenses</h3>
          <p className="text-2xl font-black text-red-600 mb-1">৳{totalOfficeExpense.toLocaleString()}</p>
          <div className="flex items-center text-sm font-medium text-red-500">
            <MinusCircle size={16} className="mr-1" /> Deducted from Gross
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">USD Rates</h3>
            <button 
              onClick={() => setIsEditingRates(!isEditingRates)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
            >
              {isEditingRates ? 'Save' : 'Edit'}
            </button>
          </div>
          
          {isEditingRates ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Buy Rate (৳)</label>
                <input 
                  type="number" 
                  value={usdRates.buyRate}
                  onChange={e => setUsdRates({...usdRates, buyRate: Number(e.target.value)})}
                  className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Charge Rate (৳)</label>
                <input 
                  type="number" 
                  value={usdRates.chargeRate}
                  onChange={e => setUsdRates({...usdRates, chargeRate: Number(e.target.value)})}
                  className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-bold text-indigo-600"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buy Rate</p>
                <p className="text-xl font-black text-gray-800">৳{usdRates.buyRate}</p>
              </div>
              <div className="border-l border-gray-100 pl-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Charge Rate</p>
                <p className="text-xl font-black text-indigo-600">৳{usdRates.chargeRate}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            Profit Velocity <span className="text-sm font-medium text-gray-400 ml-2">(Last 15 Days)</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProfitVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="profit" name="Gross Profit (৳)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manual Injection Form */}
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
          <h3 className="text-lg font-extrabold text-indigo-900 mb-4 flex items-center">
            <Plus className="mr-2 text-indigo-600" /> Manual Injection
          </h3>
          <form onSubmit={handleInject} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-1">Ledger Date</label>
              <input 
                type="date"
                required
                value={injectionForm.date}
                onChange={e => setInjectionForm({...injectionForm, date: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-1">Portfolio Segment</label>
              <select 
                required
                value={injectionForm.segment}
                onChange={e => setInjectionForm({...injectionForm, segment: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none appearance-none"
              >
                <option value="">Select Segment...</option>
                <option value="fb_ads">Facebook Ads</option>
                <option value="web_dev">Web Development</option>
                <option value="consultancy">Consultancy</option>
                <option value="other">Other / Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-1">Net Profit Amount (৳)</label>
              <input 
                type="number"
                required
                placeholder="e.g. 5000"
                value={injectionForm.amount}
                onChange={e => setInjectionForm({...injectionForm, amount: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex justify-center items-center"
            >
              <Save size={18} className="mr-2" /> Add Profit
            </button>
          </form>
        </div>
      </div>

      {/* Office Expenses Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-800 flex items-center">
            <MinusCircle className="mr-2 text-red-500" /> Office Expenses
          </h3>
          <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full text-sm">
            Total: ৳{totalOfficeExpense.toLocaleString()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Add Expense Form */}
          <div className="p-6 bg-gray-50/50">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Add New Expense</h4>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                <input 
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (৳)</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-lg transition-colors flex justify-center items-center text-sm"
              >
                <Plus size={16} className="mr-2" /> Add Expense
              </button>
            </form>
          </div>

          {/* Expense List */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 w-32">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right w-32">Amount</th>
                    <th className="p-4 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {officeExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-500">{expense.date}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">{expense.description}</td>
                      <td className="p-4 text-sm font-black text-red-600 text-right">৳{expense.amount.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {officeExpenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">
                        No expenses recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

