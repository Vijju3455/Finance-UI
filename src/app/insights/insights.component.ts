import { Component, inject, computed, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.css']
})
export class InsightsComponent implements AfterViewInit {
  readonly state = inject(StateService);

  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;

  incomeRatio = computed(() => {
    const income = this.state.totalIncome();
    const expenses = this.state.totalExpense();
    return income > 0 && expenses > 0 ? (income / expenses).toFixed(1) : '0';
  });

  topCategory = computed(() => {
    const breakdown = this.state.categoryBreakdown();
    return breakdown.length > 0 ? breakdown[0][0] : 'None';
  });

  categorySummary = computed(() => {
    const summary: Record<string, { amount: number; count: number }> = {};

    this.state.transactions().forEach(tx => {
      if (tx.type === 'expense') {
        const cat = tx.category;
        if (!summary[cat]) summary[cat] = { amount: 0, count: 0 };
        summary[cat].amount += tx.amount;
        summary[cat].count++;
      }
    });

    return Object.entries(summary)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10);
  });

  ngAfterViewInit(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);

    script.onload = () => setTimeout(() => this.initCharts(), 200);
  }

  setCategoryFilter(category: string | null) {
    this.state.selectedCategory.set(category);
  }

  clearFilter() {
    this.state.selectedCategory.set(null);
  }

  initCharts(): void {
    if (!this.pieChart?.nativeElement || !this.barChart?.nativeElement) return;

    const pieCtx = this.pieChart.nativeElement.getContext('2d')!;
    const pieData = this.state.categoryBreakdown().slice(0, 6);

    const pieInstance = new (window as any).Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: pieData.map(([cat]) => cat),
        datasets: [{
          data: pieData.map(([, amt]) => amt),
          backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'],
          borderWidth: 0
        }]
      },
      options: { 
        responsive: true, 
        plugins: { 
          legend: { 
            position: 'bottom',
            onClick: (e: any, elements: any[], chart: any) => {
              const index = elements[0]?.index;
              if (index !== undefined) {
                const category = pieData[index][0];
                this.setCategoryFilter(category);
              }
            }
          } 
        } 
      }
    });

    const barCtx = this.barChart.nativeElement.getContext('2d')!;
    new (window as any).Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{ data: [this.state.totalIncome(), this.state.totalExpense()], backgroundColor: ['#10B981', '#EF4444'], borderRadius: 8 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}