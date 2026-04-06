import { Injectable, signal, computed } from '@angular/core';

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private initialTransactions: Transaction[] = [
    { id: 1, date: '2024-04-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
    { id: 2, date: '2024-04-02', amount: 150, category: 'Food', type: 'expense', description: 'Lunch' },
    { id: 3, date: '2024-04-03', amount: 300, category: 'Transport', type: 'expense', description: 'Cab ride' },
    { id: 4, date: '2024-04-05', amount: 1000, category: 'Freelance', type: 'income', description: 'Project payment' },
    { id: 5, date: '2024-04-06', amount: 80, category: 'Groceries', type: 'expense', description: 'Weekly shopping' },
    { id: 6, date: '2024-04-08', amount: 200, category: 'Entertainment', type: 'expense', description: 'Movie' },
    { id: 7, date: '2024-04-10', amount: 250, category: 'Food', type: 'expense', description: 'Dinner out' },
    { id: 8, date: '2024-04-12', amount: 75, category: 'Transport', type: 'expense', description: 'Bus' },
    { id: 9, date: '2024-04-15', amount: 4000, category: 'Salary', type: 'income', description: 'Bonus' },
    { id: 10, date: '2024-04-16', amount: 120, category: 'Utilities', type: 'expense', description: 'Electricity' },
    { id: 11, date: '2024-04-18', amount: 50, category: 'Food', type: 'expense', description: 'Coffee' },
    { id: 12, date: '2024-04-20', amount: 600, category: 'Shopping', type: 'expense', description: 'Clothes' },
    { id: 13, date: '2024-04-22', amount: 200, category: 'Entertainment', type: 'expense', description: 'Streaming' },
    { id: 14, date: '2024-04-25', amount: 800, category: 'Investment', type: 'income', description: 'Dividends' },
    { id: 15, date: '2024-04-27', amount: 90, category: 'Groceries', type: 'expense', description: 'Fruits' },
    { id: 16, date: '2024-04-28', amount: 350, category: 'Transport', type: 'expense', description: 'Fuel' },
    { id: 17, date: '2024-04-29', amount: 100, category: 'Food', type: 'expense', description: 'Breakfast' },
    { id: 18, date: '2024-04-30', amount: 1200, category: 'Freelance', type: 'income', description: 'Extra work' },
    { id: 19, date: '2024-03-30', amount: 4800, category: 'Salary', type: 'income', description: 'Previous month' },
    { id: 20, date: '2024-03-28', amount: 180, category: 'Food', type: 'expense', description: 'Dinner' }
  ];

  transactions = signal<Transaction[]>(this.initialTransactions);

  role = signal<'viewer' | 'admin'>('viewer');
  theme = signal<'light' | 'dark'>('light');

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  selectedType = signal<'income' | 'expense' | null>(null);

  sortBy = signal<'date' | 'amount' | 'category'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // ✅ FIXED FILTER + SORT (NO MUTATION BUG)
  filteredTransactions = computed(() => {
    let txs = [...this.transactions()]; // 🔥 IMPORTANT FIX

    const term = this.searchTerm().toLowerCase();

    if (term) {
      txs = txs.filter(tx =>
        tx.description.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory()) {
      txs = txs.filter(tx => tx.category === this.selectedCategory());
    }

    if (this.selectedType()) {
      txs = txs.filter(tx => tx.type === this.selectedType());
    }

    txs.sort((a, b) => {
      let aVal: any = a[this.sortBy()];
      let bVal: any = b[this.sortBy()];

      // ✅ Proper date sorting
      if (this.sortBy() === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return this.sortOrder() === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder() === 'asc' ? 1 : -1;
      return 0;
    });

    return txs;
  });

  totalBalance = computed(() => {
    const income = this.transactions()
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = this.transactions()
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return income - expense;
  });

  filteredTotalBalance = computed(() => {
    const income = this.filteredTransactions()
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = this.filteredTransactions()
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return income - expense;
  });

  filteredTotalIncome = computed(() => 
    this.filteredTransactions()
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  filteredTotalExpense = computed(() => 
    this.filteredTransactions()
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  filteredCategoryBreakdown = computed(() => {
    const map = new Map<string, number>();
    this.filteredTransactions()
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
      });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  });

  totalIncome = computed(() =>
    this.transactions()
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  totalExpense = computed(() =>
    this.transactions()
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  categoryBreakdown = computed(() => {
    const map = new Map<string, number>();

    this.transactions().forEach(tx => {
      if (tx.type === 'expense') {
        map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
      }
    });

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  });

  highestSpendingCategory = computed(() => {
    const top = this.categoryBreakdown()[0];
    return top ? `${top[0]} ($${top[1].toLocaleString()})` : 'None';
  });

  // ✅ CRUD
  addTransaction(tx: Omit<Transaction, 'id'>) {
    if (this.role() !== 'admin') return;

    const newId = Math.max(...this.transactions().map(t => t.id), 0) + 1;

    this.transactions.update(txs => [
      ...txs,
      { ...tx, id: newId }
    ]);
  }

  updateTransaction(id: number, updates: Partial<Transaction>) {
    if (this.role() !== 'admin') return;

    this.transactions.update(txs =>
      txs.map(tx =>
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  }

  deleteTransaction(id: number) {
    if (this.role() !== 'admin') return;

    this.transactions.update(txs =>
      txs.filter(tx => tx.id !== id)
    );
  }

  setRole(role: 'viewer' | 'admin') {
    this.role.set(role);
    localStorage.setItem('role', role);
  }

  setTheme(theme: 'light' | 'dark') {
    this.theme.set(theme);

    document.documentElement.classList.toggle('dark', theme === 'dark');

    localStorage.setItem('theme', theme);
  }

  constructor() {
    const savedRole = localStorage.getItem('role') as 'viewer' | 'admin' | null;
    if (savedRole) this.role.set(savedRole);

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) this.setTheme(savedTheme);
  }
}