import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LogOut, 
  Plus, 
  History, 
  FileSpreadsheet, 
  CheckCircle, 
  Wallet, 
  User as UserIcon, 
  LayoutDashboard,
  Calendar,
  DollarSign,
  ChevronLeft,
  X,
  Settings,
  Trash2,
  Users,
  Pencil,
  Check,
  Menu, // Added Menu icon for mobile nav
  Building2 as Building2Icon,
  AlertCircle // Added for confirm state
} from 'lucide-react';

import { User, ExpenseRecord, Settlement, DepartmentMap } from './types';
import { APP_NAME, CURRENCY_SYMBOL } from './constants';
import { dbService } from './services/mockDb';
import { exportToExcel } from './utils/exportUtils';
import { Button } from './components/Button';

// --- Sub-Components ---

const LoginScreen = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({ email: email || 'demo@example.com', name: email.split('@')[0] || 'Demo User' });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{APP_NAME}</h1>
          <p className="text-slate-500 mt-2">請登入以存取部門帳務資料</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google 帳號 / Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={loading}>
            登入系統
          </Button>
          <div className="text-center text-xs text-slate-400 mt-4">
            模擬 Google 登入驗證流程
          </div>
        </form>
      </div>
    </div>
  );
};

const Navbar = ({ user, onViewChange, currentView, onLogout }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800">{APP_NAME}</span>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentView === 'dashboard' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <span className="flex items-center gap-2"><LayoutDashboard size={16}/> <span>記帳</span></span>
            </button>
            <button 
              onClick={() => handleNavClick('history')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentView === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
               <span className="flex items-center gap-2"><History size={16}/> <span>歷史結算</span></span>
            </button>
             <button 
              onClick={() => handleNavClick('settings')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentView === 'settings' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
               <span className="flex items-center gap-2"><Settings size={16}/> <span>管理</span></span>
            </button>
          </nav>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
              <UserIcon size={16} />
            </div>
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white absolute w-full left-0 shadow-lg px-4 py-4 space-y-3 z-50">
           <button 
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={20}/> 記帳
            </button>
            <button 
              onClick={() => handleNavClick('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'history' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
               <History size={20}/> 歷史結算
            </button>
             <button 
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'settings' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
               <Settings size={20}/> 管理設定
            </button>
            <div className="border-t border-slate-100 my-2 pt-2">
              <div className="flex items-center gap-3 px-4 py-3 text-slate-500">
                 <UserIcon size={20} />
                 <span className="flex-1">{user.name}</span>
                 <button onClick={onLogout} className="text-red-500 font-medium text-sm">登出</button>
              </div>
            </div>
        </div>
      )}
    </header>
  );
};

// --- Dashboard View ---

const Dashboard = ({ user }: { user: User }) => {
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentMap>({});
  const [loading, setLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false);
  const [confirmSettle, setConfirmSettle] = useState(false); // New state for 2-step confirm

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [manualName, setManualName] = useState('');

  // Fetch initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [recs, depts] = await Promise.all([
      dbService.getActiveRecords(),
      dbService.getDepartments()
    ]);
    setRecords(recs);
    setDepartments(depts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset confirmation if records change
  useEffect(() => {
    setConfirmSettle(false);
  }, [records]);

  // Dynamic Helpers
  const getAllPersonnel = useCallback(() => {
    const all: string[] = [];
    Object.values(departments).forEach(list => all.push(...list));
    return Array.from(new Set(all));
  }, [departments]);

  const getPersonDept = useCallback((name: string) => {
    for (const [dept, people] of Object.entries(departments)) {
      if (people.includes(name)) return dept;
    }
    return '其他部門'; 
  }, [departments]);

  // Helper to get priority for sorting
  const getDeptPriority = useCallback((deptName: string) => {
    if (deptName === '品質部') return 0;
    if (deptName === '技術部') return 1;
    return 99;
  }, []);

  // New Helper to group and render personnel
  const renderGroupedPersonnel = useCallback((personnelList: string[]) => {
    // 1. Group by Dept
    const groups: { [key: string]: string[] } = {};
    personnelList.forEach(p => {
      const dept = getPersonDept(p);
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(p);
    });

    // 2. Sort Depts
    const sortedDepts = Object.keys(groups).sort((a, b) => {
      const priA = getDeptPriority(a);
      const priB = getDeptPriority(b);
      return priA - priB;
    });

    // 3. Render with Colors
    return sortedDepts.map(dept => {
      let colorClass = "bg-slate-100 text-slate-700 border-slate-200"; // Default
      if (dept === '品質部') colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      else if (dept === '技術部') colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      else if (dept === '其他部門') colorClass = "bg-orange-50 text-orange-700 border-orange-200";

      return (
        <span key={dept} className={`inline-block ${colorClass} text-xs px-2 py-1 rounded-md font-medium mr-1 mb-1 border`}>
          {dept}({groups[dept].join(',')})
        </span>
      );
    });
  }, [getPersonDept, getDeptPriority]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalPersonnel = [...selectedPersonnel];
    if (manualName.trim()) {
      finalPersonnel.push(manualName.trim());
    }
    
    finalPersonnel = Array.from(new Set(finalPersonnel));

    if (!amount || finalPersonnel.length === 0) {
      alert("請填寫金額並選擇至少一位人員");
      return;
    }

    const derivedDepts = new Set<string>();
    finalPersonnel.forEach(p => {
      derivedDepts.add(getPersonDept(p));
    });

    await dbService.addRecord({
      date,
      amount: Number(amount),
      departments: Array.from(derivedDepts),
      personnel: finalPersonnel,
      description,
      createdBy: user.name
    });

    setAmount('');
    setDescription('');
    setSelectedPersonnel([]);
    setManualName('');
    loadData();
  };

  const handleSettle = async () => {
    if (records.length === 0) return;
    
    setIsSettling(true);
    try {
      const settlement = await dbService.createSettlement(user.email);
      if (settlement) {
        alert(`結算成功！單號: ${settlement.id.slice(0, 8)}...`);
        setConfirmSettle(false);
        loadData(); 
      } else {
        alert("結算失敗，請重試。");
      }
    } catch (error) {
      console.error(error);
      alert(`發生錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleSettleClick = () => {
    if (records.length === 0) return;
    
    if (confirmSettle) {
      handleSettle();
    } else {
      setConfirmSettle(true);
      // Auto-reset confirmation after 4 seconds to prevent accidental clicks later
      setTimeout(() => setConfirmSettle(false), 4000);
    }
  };

  const totalAmount = useMemo(() => records.reduce((sum, r) => sum + r.amount, 0), [records]);

  const handleExport = () => {
    // Pass getPersonDept to export utility
    exportToExcel(
      records, 
      `CloudAcc_Active_${new Date().toISOString().split('T')[0]}`,
      getPersonDept
    );
  };

  const togglePerson = (person: string) => {
    if (selectedPersonnel.includes(person)) {
      setSelectedPersonnel(prev => prev.filter(p => p !== person));
    } else {
      setSelectedPersonnel(prev => [...prev, person]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-32 space-y-4">
      
      {/* Top Section: Form + Actions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">帳務管理</h2>
            <p className="text-slate-500 text-sm">新增與管理日常支出</p>
          </div>
          <Button variant="secondary" onClick={handleExport} className="text-xs px-3 py-1.5">
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">匯出 Excel</span>
            <span className="sm:hidden">匯出</span>
          </Button>
        </div>

        {/* Input Form - Mobile Friendly */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 md:p-5">
           <form onSubmit={handleSubmit}>
             <div className="flex items-center mb-3 text-blue-800">
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-bold">新增支出</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Date */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <input 
                      type="date" 
                      required 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-3 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" 
                    />
                  </div>
                </div>

                {/* Personnel Selection Area */}
                <div className="md:col-span-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <div className="text-xs text-slate-500 mb-2 font-medium">點選人員 (可多選):</div>
                   <div className="flex flex-wrap gap-2 mb-3">
                      {getAllPersonnel().map(person => (
                        <button
                          key={person}
                          type="button"
                          onClick={() => togglePerson(person)}
                          className={`
                            px-3 py-2 md:px-2 md:py-1 rounded text-sm md:text-xs font-medium transition-colors border
                            ${selectedPersonnel.includes(person) 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}
                          `}
                        >
                          {person}
                        </button>
                      ))}
                   </div>
                   <div className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                     <span className="text-xs text-slate-500 whitespace-nowrap">其他:</span>
                     <input 
                       type="text" 
                       placeholder="手動輸入姓名..."
                       value={manualName} 
                       onChange={e => setManualName(e.target.value)}
                       className="flex-1 min-w-0 text-sm focus:outline-none bg-transparent"
                     />
                   </div>
                </div>

                {/* Amount & Description & Button */}
                <div className="md:col-span-4 flex flex-col gap-3">
                   <div className="flex gap-3">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          required 
                          min="0"
                          placeholder="金額"
                          value={amount} 
                          onChange={e => setAmount(e.target.value)}
                          className="pl-9 w-full px-3 py-3 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base font-bold text-slate-700" 
                        />
                      </div>
                      <Button type="submit" className="shrink-0 shadow-md px-6">
                         新增
                      </Button>
                   </div>
                   <input 
                      type="text" 
                      placeholder="備註說明 (選填)"
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-3 py-3 md:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    />
                </div>
             </div>
           </form>
        </div>
      </div>

      {/* Main Ledger - Responsive Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Mobile: Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
             <div className="p-8 text-center text-slate-400">載入中...</div>
          ) : records.length === 0 ? (
             <div className="p-8 text-center text-slate-400">目前沒有未結算的資料</div>
          ) : (
            records.map(record => (
              <div key={record.id} className="p-4 flex flex-col gap-2">
                 <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1">
                      {renderGroupedPersonnel(record.personnel)}
                    </div>
                    <span className="font-bold text-slate-900 text-lg whitespace-nowrap">
                       {CURRENCY_SYMBOL} {record.amount.toLocaleString()}
                    </span>
                 </div>
                 <div className="flex justify-between items-end text-sm">
                    <div className="text-slate-500 flex flex-col">
                       <span className="text-xs text-slate-400 mb-0.5">{record.date}</span>
                       <span>{record.description || '無備註'}</span>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700 w-32">日期</th>
                <th className="px-4 py-3 font-semibold text-slate-700">部門(人員)</th>
                <th className="px-4 py-3 font-semibold text-slate-700">說明</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right w-32">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">載入中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">目前沒有未結算的資料</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{record.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {renderGroupedPersonnel(record.personnel)}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-500">{record.description || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{CURRENCY_SYMBOL} {record.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Bar - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[60]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs">未結算總額</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">{CURRENCY_SYMBOL} {totalAmount.toLocaleString()}</span>
              <span className="text-slate-400 text-xs sm:text-sm">({records.length} 筆)</span>
            </div>
          </div>
          <Button 
            onClick={handleSettleClick}
            disabled={records.length === 0 || isSettling} 
            className={`shadow-lg text-white px-4 py-2 text-sm sm:text-base transition-all duration-300 ${
              confirmSettle 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
            isLoading={isSettling}
          >
            {confirmSettle ? (
              <>
                 <AlertCircle className="w-4 h-4 mr-1.5" />
                 <span className="hidden sm:inline">確定要結算嗎？(再次點擊)</span>
                 <span className="sm:hidden">確認結算?</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">執行結算 (關帳)</span>
                <span className="sm:hidden">結算關帳</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- History View ---

const HistoryView = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [departments, setDepartments] = useState<DepartmentMap>({}); // Store departments for lookup
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsMap, setDetailsMap] = useState<{[key:string]: ExpenseRecord[]}>({});
  const [loadingDetails, setLoadingDetails] = useState<{[key:string]: boolean}>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    // Load both settlements and departments to map names
    const [sets, depts] = await Promise.all([
      dbService.getSettlements(),
      dbService.getDepartments()
    ]);
    setSettlements(sets);
    setDepartments(depts);
    setLoading(false);
  };

  // Helper to find department for a person (reused from Dashboard logic)
  const getPersonDept = useCallback((name: string) => {
    for (const [dept, people] of Object.entries(departments)) {
      if (people.includes(name)) return dept;
    }
    return '其他'; 
  }, [departments]);

  // Helper to get priority for sorting
  const getDeptPriority = useCallback((deptName: string) => {
    if (deptName === '品質部') return 0;
    if (deptName === '技術部') return 1;
    return 99;
  }, []);

  // New Helper to group and render personnel (Same logic as Dashboard)
  const renderGroupedPersonnel = useCallback((personnelList: string[]) => {
    // 1. Group by Dept
    const groups: { [key: string]: string[] } = {};
    personnelList.forEach(p => {
      const dept = getPersonDept(p);
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(p);
    });

    // 2. Sort Depts
    const sortedDepts = Object.keys(groups).sort((a, b) => {
      const priA = getDeptPriority(a);
      const priB = getDeptPriority(b);
      return priA - priB;
    });

    // 3. Render with Colors
    return sortedDepts.map(dept => {
      let colorClass = "bg-slate-100 text-slate-700 border-slate-200"; // Default
      if (dept === '品質部') colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      else if (dept === '技術部') colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      else if (dept === '其他部門') colorClass = "bg-orange-50 text-orange-700 border-orange-200";

      return (
        <span key={dept} className={`inline-block ${colorClass} text-xs px-2 py-1 rounded-md font-medium mr-1 mb-1 border`}>
          {dept}({groups[dept].join(',')})
        </span>
      );
    });
  }, [getPersonDept, getDeptPriority]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    
    if (!detailsMap[id]) {
        setLoadingDetails(prev => ({...prev, [id]: true}));
        const recs = await dbService.getSettlementDetails(id);
        setDetailsMap(prev => ({...prev, [id]: recs}));
        setLoadingDetails(prev => ({...prev, [id]: false}));
    }
  };

  const handleExport = (e: React.MouseEvent, settlement: Settlement) => {
      e.stopPropagation();
      const doExport = async () => {
          let recs = detailsMap[settlement.id];
          if (!recs) {
              recs = await dbService.getSettlementDetails(settlement.id);
              setDetailsMap(prev => ({...prev, [settlement.id]: recs}));
          }
          // Pass getPersonDept to export utility
          exportToExcel(recs, `Settlement_${settlement.date}`, getPersonDept);
      }
      doExport();
  };

  if (loading) return <div className="p-8 text-center text-slate-400">載入中...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
       <div>
        <h2 className="text-xl font-bold text-slate-800">歷史結算記錄</h2>
        <p className="text-slate-500 text-sm">查看過往的結算單與詳細支出內容</p>
      </div>

      <div className="space-y-4">
        {settlements.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                尚無歷史結算記錄
             </div>
        ) : (
            settlements.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div 
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors gap-4"
                        onClick={() => toggleExpand(s.id)}
                    >
                        <div className="flex items-start gap-3">
                             <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <FileSpreadsheet className="w-5 h-5" />
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">{s.date}</span>
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">已結算</span>
                                </div>
                                {/* Added Period Range Display */}
                                <div className="text-sm text-slate-500 mt-1 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1 text-slate-600">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {s.periodStart} ~ {s.periodEnd}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        單號: {s.id.slice(0, 8)} • {s.recordCount} 筆資料 • By: {s.createdBy.split('@')[0]}
                                    </span>
                                </div>
                             </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                             <span className="text-lg font-bold text-slate-800">{CURRENCY_SYMBOL} {s.totalAmount.toLocaleString()}</span>
                             <Button 
                                variant="secondary" 
                                className="px-3 py-1 text-xs h-8"
                                onClick={(e) => handleExport(e, s)}
                             >
                                匯出
                             </Button>
                        </div>
                    </div>

                    {expandedId === s.id && (
                        <div className="border-t border-slate-100 bg-slate-50 p-4">
                             {loadingDetails[s.id] ? (
                                 <div className="text-center text-slate-400 py-4">載入明細中...</div>
                             ) : (
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-sm text-left">
                                         <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                                             <tr>
                                                 <th className="px-3 py-2">日期</th>
                                                 <th className="px-3 py-2">部門(人員)</th>
                                                 <th className="px-3 py-2">金額</th>
                                                 <th className="px-3 py-2">說明</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-200">
                                             {detailsMap[s.id]?.map(r => (
                                                 <tr key={r.id}>
                                                     <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                                                     <td className="px-3 py-2">
                                                        <div className="flex flex-wrap gap-1">
                                                          {renderGroupedPersonnel(r.personnel)}
                                                        </div>
                                                     </td>
                                                     <td className="px-3 py-2 font-medium">{r.amount}</td>
                                                     <td className="px-3 py-2 text-slate-500">{r.description}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
};

// --- Settings View (New) ---

const SettingsView = () => {
  const [departments, setDepartments] = useState<DepartmentMap>({});
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [newPersonInputs, setNewPersonInputs] = useState<{[key:string]: string}>({});

  // Editing State
  const [editDept, setEditDept] = useState<{original: string, current: string} | null>(null);
  const [editPerson, setEditPerson] = useState<{dept: string, original: string, current: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getDepartments();
    setDepartments(data);
    setLoading(false);
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    if (departments[newDeptName.trim()]) {
      alert("部門已存在");
      return;
    }
    const updated = { ...departments, [newDeptName.trim()]: [] };
    await dbService.saveDepartments(updated);
    setDepartments(updated);
    setNewDeptName('');
  };

  const handleRenameDept = async () => {
    if (!editDept || !editDept.current.trim()) return;
    const newName = editDept.current.trim();
    const oldName = editDept.original;

    if (newName !== oldName && departments[newName]) {
      alert("該部門名稱已存在");
      return;
    }

    const updated = { ...departments };
    updated[newName] = updated[oldName]; // Copy data to new key
    if (newName !== oldName) {
      delete updated[oldName]; // Remove old key
    }

    await dbService.saveDepartments(updated);
    setDepartments(updated);
    setEditDept(null);
  };

  const handleDeleteDept = async (deptName: string) => {
    if (!window.confirm(`確定要刪除 ${deptName} 嗎？`)) return;
    const updated = { ...departments };
    delete updated[deptName];
    await dbService.saveDepartments(updated);
    setDepartments(updated);
  };

  const handleAddPerson = async (deptName: string) => {
    const personName = newPersonInputs[deptName]?.trim();
    if (!personName) return;
    
    if (departments[deptName].includes(personName)) return;

    const updated = {
      ...departments,
      [deptName]: [...departments[deptName], personName]
    };
    
    await dbService.saveDepartments(updated);
    setDepartments(updated);
    setNewPersonInputs(prev => ({ ...prev, [deptName]: '' }));
  };

  const handleRenamePerson = async () => {
    if (!editPerson || !editPerson.current.trim()) return;
    const { dept, original, current } = editPerson;
    const newName = current.trim();

    if (newName !== original && departments[dept].includes(newName)) {
      alert("該人員已存在此部門");
      return;
    }

    const updated = { ...departments };
    updated[dept] = updated[dept].map(p => p === original ? newName : p);

    await dbService.saveDepartments(updated);
    setDepartments(updated);
    setEditPerson(null);
  };

  const handleDeletePerson = async (deptName: string, personName: string) => {
    const updated = {
      ...departments,
      [deptName]: departments[deptName].filter(p => p !== personName)
    };
    await dbService.saveDepartments(updated);
    setDepartments(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">部門與人員管理</h2>
        <p className="text-slate-500 text-sm">設定部門架構及成員名單 (可點擊筆型圖示修改)</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={handleAddDept} className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 max-w-sm">
             <label className="block text-sm font-medium text-slate-700 mb-1">新增部門</label>
             <input 
                type="text" 
                placeholder="輸入部門名稱"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
             />
          </div>
          <Button type="submit" disabled={!newDeptName.trim()} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> 新增
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
           <div className="text-center text-slate-400 col-span-2">載入中...</div>
        ) : Object.entries(departments).map(([deptName, people]) => (
          <div key={deptName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center h-16">
               <div className="flex items-center gap-2 flex-1 min-w-0">
                 <Building2Icon className="w-4 h-4 text-slate-400 shrink-0" />
                 {editDept?.original === deptName ? (
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input 
                        autoFocus
                        type="text"
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
                        value={editDept.current}
                        onChange={e => setEditDept({...editDept, current: e.target.value})}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameDept();
                          if (e.key === 'Escape') setEditDept(null);
                        }}
                      />
                      <button onClick={handleRenameDept} className="text-green-600 hover:text-green-700 shrink-0"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditDept(null)} className="text-red-500 hover:text-red-600 shrink-0"><X className="w-4 h-4" /></button>
                   </div>
                 ) : (
                   <h3 className="font-bold text-slate-700 truncate">{deptName}</h3>
                 )}
               </div>
               
               {editDept?.original !== deptName && (
                <div className="flex items-center gap-1 shrink-0">
                   <button 
                     onClick={() => setEditDept({ original: deptName, current: deptName })}
                     className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors"
                     title="修改名稱"
                   >
                     <Pencil className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => handleDeleteDept(deptName)}
                     className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                     title="刪除部門"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
               )}
             </div>
             
             <div className="p-4">
               <div className="flex flex-wrap gap-2 mb-4">
                 {people.map(person => {
                   const isEditing = editPerson?.dept === deptName && editPerson?.original === person;
                   
                   return isEditing ? (
                      <div key={person} className="inline-flex items-center gap-1 bg-white border border-blue-300 rounded-full px-2 py-0.5 shadow-sm">
                        <input 
                          autoFocus
                          className="w-20 text-sm border-none focus:ring-0 p-0 text-slate-700 bg-transparent"
                          value={editPerson.current}
                          onChange={e => setEditPerson({...editPerson, current: e.target.value})}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenamePerson();
                            if (e.key === 'Escape') setEditPerson(null);
                          }}
                        />
                         <button onClick={handleRenamePerson} className="text-green-600"><Check className="w-3 h-3" /></button>
                         <button onClick={() => setEditPerson(null)} className="text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                   ) : (
                     <span key={person} className="group inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:border-blue-300 transition-colors">
                       {person}
                       <div className="flex items-center ml-2 border-l border-blue-200 pl-1.5 space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditPerson({ dept: deptName, original: person, current: person })}
                            className="text-blue-600 hover:text-blue-800"
                            title="修改"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeletePerson(deptName, person)}
                            className="text-blue-400 hover:text-red-500"
                            title="刪除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                       </div>
                     </span>
                   );
                 })}
                 {people.length === 0 && <span className="text-sm text-slate-400 italic">尚無人員</span>}
               </div>

               <div className="flex gap-2 mt-2">
                 <input 
                    type="text" 
                    placeholder="輸入姓名..."
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-blue-500 outline-none"
                    value={newPersonInputs[deptName] || ''}
                    onChange={e => setNewPersonInputs(prev => ({...prev, [deptName]: e.target.value}))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddPerson(deptName);
                    }}
                 />
                 <Button 
                   variant="secondary" 
                   onClick={() => handleAddPerson(deptName)}
                   className="py-1.5 px-3"
                   disabled={!newPersonInputs[deptName]?.trim()}
                 >
                   <Plus className="w-4 h-4" />
                 </Button>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'settings'>('dashboard');

  // Check for existing session (simplified)
  useEffect(() => {
    const savedUser = localStorage.getItem('cloudacc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('cloudacc_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cloudacc_user');
    setCurrentView('dashboard');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar 
        user={user} 
        currentView={currentView}
        onViewChange={setCurrentView} 
        onLogout={handleLogout} 
      />
      <main className="flex-grow">
        {currentView === 'dashboard' ? (
          <Dashboard user={user} />
        ) : currentView === 'history' ? (
          <HistoryView />
        ) : (
          <SettingsView />
        )}
      </main>
    </div>
  );
}