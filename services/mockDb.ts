import { ExpenseRecord, Settlement, DepartmentMap } from '../types';
import { DEPARTMENTS as DEFAULT_DEPARTMENTS } from '../constants';

/* 
 * NOTE: In a real production environment, this file would import Firebase/Firestore 
 * SDKs and interact with the cloud database. 
 * For this "complete and functional" demo without API keys, we simulate 
 * the async cloud behavior using LocalStorage.
 */

const RECORDS_KEY = 'cloudacc_records';
const SETTLEMENTS_KEY = 'cloudacc_settlements';
const DEPARTMENTS_KEY = 'cloudacc_departments';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Robust ID generator that works in non-secure contexts (unlike crypto.randomUUID)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const dbService = {
  // --- Departments & Personnel ---
  async getDepartments(): Promise<DepartmentMap> {
    await delay(200);
    const str = localStorage.getItem(DEPARTMENTS_KEY);
    if (!str) {
      // Initialize with defaults if not present
      localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
      return DEFAULT_DEPARTMENTS;
    }
    return JSON.parse(str);
  },

  async saveDepartments(data: DepartmentMap): Promise<void> {
    await delay(300);
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(data));
  },

  // --- Expense Records ---

  async getActiveRecords(): Promise<ExpenseRecord[]> {
    await delay(300); // Simulate network latency
    const allStr = localStorage.getItem(RECORDS_KEY);
    const all: ExpenseRecord[] = allStr ? JSON.parse(allStr) : [];
    // Return only unsettled records
    return all.filter(r => !r.isSettled).sort((a, b) => b.createdAt - a.createdAt);
  },

  async getAllRecords(): Promise<ExpenseRecord[]> {
    await delay(300);
    const allStr = localStorage.getItem(RECORDS_KEY);
    return allStr ? JSON.parse(allStr) : [];
  },

  async addRecord(record: Omit<ExpenseRecord, 'id' | 'createdAt' | 'isSettled'>): Promise<ExpenseRecord> {
    await delay(400);
    const allStr = localStorage.getItem(RECORDS_KEY);
    const all: ExpenseRecord[] = allStr ? JSON.parse(allStr) : [];

    const newRecord: ExpenseRecord = {
      ...record,
      id: generateId(),
      createdAt: Date.now(),
      isSettled: false,
    };

    localStorage.setItem(RECORDS_KEY, JSON.stringify([newRecord, ...all]));
    return newRecord;
  },

  // --- Settlements (Closing the books) ---

  async getSettlements(): Promise<Settlement[]> {
    await delay(300);
    const str = localStorage.getItem(SETTLEMENTS_KEY);
    const data: Settlement[] = str ? JSON.parse(str) : [];
    return data.sort((a, b) => b.createdAt - a.createdAt);
  },

  async getSettlementDetails(settlementId: string): Promise<ExpenseRecord[]> {
    await delay(300);
    const allStr = localStorage.getItem(RECORDS_KEY);
    const all: ExpenseRecord[] = allStr ? JSON.parse(allStr) : [];
    return all.filter(r => r.settlementId === settlementId);
  },

  async createSettlement(userEmail: string): Promise<Settlement | null> {
    await delay(800); // Simulate heavier transaction
    const allStr = localStorage.getItem(RECORDS_KEY);
    let allRecords: ExpenseRecord[] = allStr ? JSON.parse(allStr) : [];

    // 1. Identify records to settle
    const openRecords = allRecords.filter(r => !r.isSettled);

    if (openRecords.length === 0) return null;

    // 2. Calculate stats
    const totalAmount = openRecords.reduce((sum, r) => sum + Number(r.amount), 0);
    
    // Robust date calculation
    let minDate = new Date().toISOString().split('T')[0];
    let maxDate = new Date().toISOString().split('T')[0];
    
    try {
        const dates = openRecords.map(r => new Date(r.date).getTime()).filter(t => !isNaN(t));
        if (dates.length > 0) {
            minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
            maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
        }
    } catch (e) {
        console.warn("Date calculation error", e);
    }

    // 3. Create Settlement Object
    const settlementId = generateId();
    const settlement: Settlement = {
      id: settlementId,
      date: new Date().toISOString().split('T')[0], // Today is the settlement date
      totalAmount,
      recordCount: openRecords.length,
      periodStart: minDate,
      periodEnd: maxDate,
      createdBy: userEmail,
      createdAt: Date.now()
    };

    // 4. Update records to settled
    const updatedRecords = allRecords.map(r => {
      if (!r.isSettled) {
        return { ...r, isSettled: true, settlementId };
      }
      return r;
    });

    // 5. Save everything
    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    
    const setStr = localStorage.getItem(SETTLEMENTS_KEY);
    const settlements: Settlement[] = setStr ? JSON.parse(setStr) : [];
    localStorage.setItem(SETTLEMENTS_KEY, JSON.stringify([settlement, ...settlements]));

    return settlement;
  }
};