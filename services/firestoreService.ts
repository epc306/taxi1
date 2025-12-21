// @ts-nocheck
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
// Accessing import.meta.env safely prevents runtime crashes if it's undefined.
// Using the "&&" pattern ensures Vite can still statically replace the 'import.meta.env.VITE_...' string token.

const firebaseConfig = {
  apiKey: (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: (import.meta.env && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: (import.meta.env && import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: (import.meta.env && import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: (import.meta.env && import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: (import.meta.env && import.meta.env.VITE_FIREBASE_APP_ID)
};

// Initialize Firebase
let db: any; 

try {
    // Check if config is valid (at least apiKey must exist)
    if (!firebaseConfig.apiKey) {
        console.warn("CloudAcc: Firebase API Key is missing. The app will run in read-only/offline mode or show empty data.");
        console.warn("If you are running in production, ensure .env variables are set and VITE_ prefix is used.");
    } else {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
} catch (e) {
    console.error("CloudAcc: Failed to initialize Firebase.", e);
}

// Helper to check DB availability
const checkDb = () => {
    if (!db) {
        return false;
    }
    return true;
};

// --- Collection References ---
const DEPTS_COLLECTION = 'settings';
const DEPTS_DOC_ID = 'departments';
const RECORDS_COLLECTION = 'records';
const SETTLEMENTS_COLLECTION = 'settlements';

export const dbService = {
  // --- Departments & Personnel ---
  
  async getDepartments(): Promise<DepartmentMap> {
    if (!checkDb()) return DEFAULT_DEPARTMENTS;
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
    if (!checkDb()) throw new Error("Database not connected (Missing API Key)");
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
    if (!checkDb()) return [];
    try {
      const q = query(
        collection(db, RECORDS_COLLECTION),
        where('isSettled', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as object)
      } as ExpenseRecord));
    } catch (error) {
      console.error("Error fetching active records:", error);
      return [];
    }
  },

  async getAllRecords(): Promise<ExpenseRecord[]> {
    if (!checkDb()) return [];
    const q = query(collection(db, RECORDS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as ExpenseRecord));
  },

  async addRecord(record: Omit<ExpenseRecord, 'id' | 'createdAt' | 'isSettled'>): Promise<ExpenseRecord> {
    if (!checkDb()) throw new Error("Database not connected (Missing API Key)");
    try {
      const newRecordData = {
        ...record,
        createdAt: Date.now(), 
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
    if (!checkDb()) return [];
    try {
      const q = query(
        collection(db, SETTLEMENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as Settlement));
    } catch (error) {
      console.error("Error fetching settlements:", error);
      return [];
    }
  },

  async getSettlementDetails(settlementId: string): Promise<ExpenseRecord[]> {
    if (!checkDb()) return [];
    try {
      const q = query(
        collection(db, RECORDS_COLLECTION),
        where('settlementId', '==', settlementId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as ExpenseRecord));
    } catch (error) {
      console.error("Error fetching settlement details:", error);
      return [];
    }
  },

  async createSettlement(userEmail: string): Promise<Settlement | null> {
    if (!checkDb()) return null;
    try {
      // 1. Get all unsettled records
      const q = query(
        collection(db, RECORDS_COLLECTION),
        where('isSettled', '==', false)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;

      const openRecords = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as ExpenseRecord));

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