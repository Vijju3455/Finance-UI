import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StateService } from '../../services/state.service';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard Overview', },
  { path: '/transactions', icon: '💳', label: 'Transactions' },
  { path: '/insights', icon: '📈', label: 'Insights' }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen py-8 px-4 shadow-lg">
      <nav class="flex-1">
        <ul class="space-y-2">
          @for (item of navItems; track item.path) {
            <li>
              <a 
                [routerLink]="item.path" 
                routerLinkActive="bg-blue-500 text-white shadow-md"
                class="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                <span class="text-xl">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SidebarComponent {
  readonly navItems = navItems;
}

