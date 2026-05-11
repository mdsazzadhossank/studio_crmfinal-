import React, { useState } from 'react';
import { Users, DollarSign, Plus, Minus, FileText, CheckCircle2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const mockEmployees = [
  { id: 1, name: 'Rahim Uddin', role: 'FB Ads Expert', baseSalary: 35000, advanceTaken: 5000, currentDue: 30000, status: 'Active', transactions: [{ id: 101, date: '2026-05-02', type: 'Advance', amount: 5000, note: 'Personal Reason' }] },
  { id: 2, name: 'Karim Hasan', role: 'Web Developer', baseSalary: 45000, advanceTaken: 0, currentDue: 45000, status: 'Active', transactions: [] },
  { id: 3, name: 'Jannat Ferdous', role: 'UI/UX Designer', baseSalary: 40000, advanceTaken: 15000, currentDue: 25000, status: 'Active', transactions: [{ id: 102, date: '2026-05-05', type: 'Advance', amount: 15000, note: 'Emergency' }] },
];

export default function EmployeeSalaryView() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [actionType, setActionType] = useState<'advance' | 'pay' | 'add' | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', baseSalary: '' });
  const [expandedEmpId, setExpandedEmpId] = useState<number | null>(null);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (actionType === 'add') {
      if (!newEmployee.name || !newEmployee.role || !newEmployee.baseSalary) return;
      
      const salary = Number(newEmployee.baseSalary);
      const newEmp = {
        id: Date.now(),
        name: newEmployee.name,
        role: newEmployee.role,
        baseSalary: salary,
        advanceTaken: 0,
        currentDue: salary,
        status: 'Active',
        transactions: []
      };
      
      setEmployees([...employees, newEmp]);
      alert('Employee added successfully!');
      setActionType(null);
      setNewEmployee({ name: '', role: '', baseSalary: '' });
      return;
    }

    if (!selectedEmployee || !amount || !actionDate) return;

    const val = Number(amount);
    const newTransaction = {
      id: Date.now(),
      date: actionDate,
      type: actionType === 'advance' ? 'Advance' : 'Salary',
      amount: val,
      note: note || (actionType === 'advance' ? 'Advance Payment' : 'Salary Payment')
    };
    
    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmployee.id) {
        if (actionType === 'advance') {
          return {
            ...emp,
            advanceTaken: emp.advanceTaken + val,
            currentDue: emp.currentDue - val,
            transactions: [newTransaction, ...emp.transactions]
          };
        } else if (actionType === 'pay') {
          return {
            ...emp,
            currentDue: emp.currentDue - val,
            transactions: [newTransaction, ...emp.transactions]
          };
        }
      }
      return emp;
    }));

    alert(`${actionType === 'advance' ? 'Advance' : 'Salary'} added successfully!`);
    setSelectedEmployee(null);
    setActionType(null);
    setAmount('');
    setNote('');
    setActionDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center">
            <DollarSign className="mr-2 text-indigo-600" /> Employee Payroll
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage monthly salaries and advances</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-500 uppercase">Total Monthly Payroll</p>
          <p className="text-3xl font-black text-indigo-700">
            ৳{employees.reduce((acc, emp) => acc + emp.baseSalary, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center">
              <Users className="mr-2 text-indigo-500" /> Employee List
            </h3>
            <button 
              onClick={() => { setSelectedEmployee(null); setActionType('add'); }}
              className="flex items-center text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
            >
              <Plus size={16} className="mr-1" /> Add Employee
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold pb-2">
                  <th className="p-3">Employee</th>
                  <th className="p-3 text-right">Base Salary</th>
                  <th className="p-3 text-right">Advance Taken</th>
                  <th className="p-3 text-right">Current Due</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <React.Fragment key={emp.id}>
                  <tr className={`border-b border-gray-50 text-sm font-medium text-gray-800 hover:bg-gray-50/50 ${expandedEmpId === emp.id ? 'bg-indigo-50/30' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setExpandedEmpId(expandedEmpId === emp.id ? null : emp.id)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                        >
                          {expandedEmpId === emp.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div>
                          <p className="font-bold text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-gray-700">৳{emp.baseSalary.toLocaleString()}</td>
                    <td className="p-3 text-right text-red-600 font-bold">
                      {emp.advanceTaken > 0 ? `৳${emp.advanceTaken.toLocaleString()}` : '0'}
                    </td>
                    <td className="p-3 text-right">
                      {emp.currentDue >= 0 ? (
                        <span className="text-emerald-600 font-black">৳{emp.currentDue.toLocaleString()}</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-gray-400 font-medium text-xs">No Due</span>
                          <span className="text-red-500 font-black text-xs bg-red-50 px-2 py-0.5 rounded mt-1">
                            Extra Adv: ৳{Math.abs(emp.currentDue).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                         <button 
                            onClick={() => { setSelectedEmployee(emp); setActionType('advance'); }}
                            className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                         >
                           Give Advance
                         </button>
                         <button 
                            onClick={() => { setSelectedEmployee(emp); setActionType('pay'); }}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                         >
                           Pay Salary
                         </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedEmpId === emp.id && (
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td colSpan={5} className="p-0">
                        <div className="p-4 px-8 border-l-2 border-indigo-500">
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <FileText size={16} className="mr-2 text-indigo-500" /> 
                            Transaction History (Advance & Salary Details)
                          </h4>
                          
                          {emp.transactions.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No transactions found for this employee.</p>
                          ) : (
                            <table className="w-full text-left text-sm bg-white rounded-lg shadow-sm overflow-hidden">
                              <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                                <tr>
                                  <th className="p-2 pl-4">Date</th>
                                  <th className="p-2">Type</th>
                                  <th className="p-2">Note / Month</th>
                                  <th className="p-2 text-right pr-4">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {emp.transactions.map((t: any) => (
                                  <tr key={t.id}>
                                    <td className="p-2 pl-4 flex items-center text-gray-600 font-medium whitespace-nowrap">
                                      <Calendar size={12} className="mr-1.5" /> {new Date(t.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-2">
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'Advance' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {t.type}
                                      </span>
                                    </td>
                                    <td className="p-2 text-gray-600">{t.note}</td>
                                    <td className={`p-2 text-right font-bold pr-4 ${t.type === 'Advance' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                      ৳{t.amount.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 flex items-center">
            <FileText className="mr-2 text-indigo-600" /> {actionType === 'add' ? 'Add New Employee' : 'Payment & Advance'}
          </h3>
          
          {actionType === 'add' ? (
            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Employee Name</label>
                <input 
                  type="text" required
                  value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role / Designation</label>
                <input 
                  type="text" required
                  value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                  placeholder="e.g. Graphic Designer"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Base Salary (৳)</label>
                <input 
                  type="number" required
                  value={newEmployee.baseSalary} onChange={e => setNewEmployee({...newEmployee, baseSalary: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none font-bold text-lg"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center">
                  <CheckCircle2 size={18} className="mr-2" /> Add Employee
                </button>
                <button type="button" onClick={() => setActionType(null)} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : !selectedEmployee ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
              <p className="font-medium text-sm">Select an action for an employee to proceed.</p>
            </div>
          ) : (
            <form onSubmit={handleAction} className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Selected Employee</p>
                <p className="font-black text-gray-900">{selectedEmployee.name}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-medium text-gray-600">Action:</span>
                  <span className={`font-bold ${actionType === 'advance' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {actionType === 'advance' ? 'Give Advance' : 'Pay Salary'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={actionDate}
                    onChange={e => setActionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm font-medium text-gray-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Amount (৳)</label>
                  <input 
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none font-bold text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Note / Description</label>
                <input 
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. April 2026 Salary"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="submit"
                  className={`flex-1 text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center ${
                    actionType === 'advance' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  <CheckCircle2 size={18} className="mr-2" /> Confirm {actionType === 'advance' ? 'Advance' : 'Payment'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setSelectedEmployee(null); setActionType(null); }}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
