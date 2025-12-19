import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  writeBatch, 
  Timestamp 
} from 'firebase/firestore';
import { ExpenseRecord, Settlement, DepartmentMap } from '../types';
import { DEPARTMENTS as DEFAULT_DEPARTMENTS } from '../constants';

// --- Configuration ---
// Make sure to set these variables in your .env file
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
// Note: If config is missing, this might throw. Ensure .env is set.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Collection References ---
const DEPTS_COLLECTION = 'settings';
const DEPTS_DOC_ID = 'departments';
const RECORDS_COLLECTION = 'records';
const SETTLEMENTS_COLLECTION = 'settlements';

export const dbService = {
  // --- Departments & Personnel ---
  
  async getDepartments(): Promise<DepartmentMap> {
    try {
      const docRef = doc(db, DEPTS_COLLECTION, DEPTS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as DepartmentMap;
      } else {
        // Initialize default if not exists
        await setDoc(docRef, DEFAULT_DEPARTMENTS);
        return DEFAULT_DEPARTMENTS;
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      return DEFAULT_DEPARTMENTS;
    }
  },

  async saveDepartments(data: DepartmentMap): Promise<void> {
    try {
      const docRef = doc(db, DEPTS_COLLECTION, DEPTS_DOC_ID);
      await setDoc(docRef, data);
    } catch (error) {
      console.error("Error saving departments:", error);
      throw error;
    }
  },

  // --- Expense Records ---

  async getActiveRecords(): Promise<ExpenseRecord[]> {
    try {
      const q = query(
        collection(db, RECORDS_COLLECTION),
        where('isSettled', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ExpenseRecord));
    } catch (error) {
      console.error("Error fetching active records:", error);
      return [];
    }
  },

  async getAllRecords(): Promise<ExpenseRecord[]> {
    // Caution: This might be large
    const q = query(collection(db, RECORDS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord));
  },

  async addRecord(record: Omit<ExpenseRecord, 'id' | 'createdAt' | 'isSettled'>): Promise<ExpenseRecord> {
    try {
      const newRecordData = {
        ...record,
        createdAt: Date.now(), // Store as number for consistency with types, or use Timestamp.now().toMillis()
        isSettled: false,
      };

      const docRef = await addDoc(collection(db, RECORDS_COLLECTION), newRecordData);
      
      return {
        id: docRef.id,
        ...newRecordData
      } as ExpenseRecord;
    } catch (error) {
      console.error("Error adding record:", error);
      throw error;
    }
  },

  // --- Settlements (Closing the books) ---

  async getSettlements(): Promise<Settlement[]> {
    try {
      const q = query(
        collection(db, SETTLEMENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Settlement));
    } catch (error) {
      console.error("Error fetching settlements:", error);
      return [];
    }
  },

  async getSettlementDetails(settlementId: string): Promise<ExpenseRecord[]> {
    try {
      // Find records that belong to this settlement
      // Note: This requires an index on 'settlementId' + 'createdAt' ideally, or just 'settlementId'
      const q = query(
        collection(db, RECORDS_COLLECTION),
        where('settlementId', '==', settlementId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord));
    } catch (error) {
      console.error("Error fetching settlement details:", error);
      return [];
    }
  },

  async createSettlement(userEmail: string): Promise<Settlement | null> {
    try {
      // 1. Get all unsettled records
      const q = query(
        collection(db, RECORDS_COLLECTION),
        where('isSettled', '==', false)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;

      const openRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord));

      // 2. Calculate stats
      const totalAmount = openRecords.reduce((sum, r) => sum + Number(r.amount), 0);
      
      let minDate = new Date().toISOString().split('T')[0];
      let maxDate = new Date().toISOString().split('T')[0];
      
      const dates = openRecords.map(r => new Date(r.date).getTime()).filter(t => !isNaN(t));
      if (dates.length > 0) {
          minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
          maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
      }

      // 3. Prepare Settlement Data
      const settlementData: Omit<Settlement, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        totalAmount,
        recordCount: openRecords.length,
        periodStart: minDate,
        periodEnd: maxDate,
        createdBy: userEmail,
        createdAt: Date.now()
      };

      // 4. Batch Write (Firestore limit is 500 ops per batch)
      const batch = writeBatch(db);
      
      // Create Settlement Doc
      const settlementRef = doc(collection(db, SETTLEMENTS_COLLECTION));
      batch.set(settlementRef, settlementData);

      // Update Records
      snapshot.docs.forEach(docSnap => {
        batch.update(docSnap.ref, {
          isSettled: true,
          settlementId: settlementRef.id
        });
      });

      await batch.commit();

      return {
        id: settlementRef.id,
        ...settlementData
      };

    } catch (error) {
      console.error("Error creating settlement:", error);
      throw error;
    }
  }
};