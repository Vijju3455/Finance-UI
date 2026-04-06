import { Component, inject, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, Transaction } from '../services/state.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html'
})
export class TransactionsComponent {
  state = inject(StateService);

  localCategory = '';
  localType: 'income' | 'expense' | '' = '';
  localSearch = '';

  categories = computed(() => Array.from(new Set(this.state.transactions().map((tx: Transaction) => tx.category))));

  constructor() {
    effect(() => {
      this.localCategory = this.state.selectedCategory() || '';
      this.localType = this.state.selectedType() || '';
      this.localSearch = this.state.searchTerm() || '';
    });
  }

  onInput() {
    setTimeout(() => {
      this.state.selectedCategory.set(this.localCategory || null);
      this.state.selectedType.set(this.localType === '' ? null : this.localType);
      // No searchTerm since search removed
    }, 300);
  }

  clearFilters() {
    this.localCategory = '';
    this.localType = '';
    this.state.searchTerm.set('');
    this.state.selectedCategory.set(null);
    this.state.selectedType.set(null);
  }

  // ✅ NEW TRANSACTION FORM
  addTx() {
    const description = prompt('Description:');
    if (!description) return;

    const category = prompt('Category:');
    if (!category) return;

    const amountStr = prompt('Amount:');
    const amount = parseFloat(amountStr || '0');
    if (isNaN(amount) || amount <= 0) {
      alert('Valid amount required');
      return;
    }

    const type = prompt('Type (income/expense):') as 'income' | 'expense';
    if (type !== 'income' && type !== 'expense') {
      alert('Type must be "income" or "expense"');
      return;
    }

    const date = prompt('Date (YYYY-MM-DD):') || new Date().toISOString().split('T')[0];

    this.state.addTransaction({
      date, 
      amount, 
      category, 
      type, 
      description
    });

    alert('✅ Transaction added!');
  }

  getFormattedAmount(amount: number): string {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  editTx(id: number) {
    const tx = this.state.transactions().find(t => t.id === id);
    if (tx) {
      const newAmount = prompt('New amount:', tx.amount.toString());
      if (newAmount !== null) {
        const amount = parseFloat(newAmount);
        if (!isNaN(amount) && amount > 0) {
          this.state.updateTransaction(id, { amount });
          alert('✅ Updated!');
        }
      }
    }
  }

  deleteTx(id: number) {
    if (confirm(`Delete #${id}?`)) {
      this.state.deleteTransaction(id);
      alert('✅ Deleted!');
    }
  }
}

