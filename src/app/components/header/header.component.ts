import { Component, inject } from '@angular/core';
import { StateService } from '../../services/state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <!-- Logo/Title -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Finance Dashboard</h1>
      </div>

      <!-- Controls -->
      <div class="flex items-center space-x-4">
        <!-- Theme Toggle -->
        <button 
          (click)="toggleTheme()" 
          class="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          title="Toggle theme"
          [attr.aria-label]="'Switch to ' + (state.theme() === 'dark' ? 'light' : 'dark') + ' mode'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
          </svg>
        </button>

        <!-- Role Toggle -->
        <div class="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Role:</label>
          <select 
            [(ngModel)]="selectedRole" 
            (change)="setRole(selectedRole)"
            class="bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm font-medium px-2 py-1">
            <option value="viewer" class="bg-white dark:bg-gray-900">Viewer</option>
            <option value="admin" class="bg-white dark:bg-gray-900">Admin</option>
          </select>
        </div>

        <!-- Category Filter Display -->
        <div *ngIf="state.selectedCategory()" class="flex items-center space-x-2 p-3 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 rounded-xl backdrop-blur-sm animate-pulse">
          <span class="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">FILTER</span>
          <span class="font-semibold text-indigo-900 dark:text-indigo-100">{{ state.selectedCategory() }}</span>
          <button 
            (click)="clearCategoryFilter()"
            class="ml-2 p-1.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-lg transition-colors text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent {
  state = inject(StateService);
  selectedRole = this.state.role();

  toggleTheme() {
    const newTheme = this.state.theme() === 'light' ? 'dark' : 'light';
    this.state.setTheme(newTheme);
  }

  setRole(role: 'viewer' | 'admin') {
    this.state.setRole(role);
    this.selectedRole = role;
  }

  clearCategoryFilter() {
    this.state.selectedCategory.set(null);
  }
}

