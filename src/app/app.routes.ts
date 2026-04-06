import { Routes } from '@angular/router';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { InsightsComponent } from './insights/insights.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardOverviewComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'insights', component: InsightsComponent }
];

