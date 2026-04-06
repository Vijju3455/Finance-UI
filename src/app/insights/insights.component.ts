import { Component, inject, computed, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';

declare const Chart: any;

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

  private pieChartInstance: any = null;
  private barChartInstance: any = null;

  incomeRatio = computed(() => {
    const income = this.state.filteredTotalIncome();
    const expenses = this.state.filteredTotalExpense();
    return income > 0 && expenses > 0 ? (income / expenses).toFixed(1) : '0';
  });

  topCategory = computed(() => {
    const breakdown = this.state.filteredCategoryBreakdown();
    return breakdown.length > 0 ? breakdown[0][0] : 'None';
  });

  filteredCategorySummary = computed(() => {
    const summary: Record<string, { amount: number; count: number }> = {};

    this.state.filteredTransactions().forEach(tx => {
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

  categorySummary = computed(() => this.filteredCategorySummary());

  constructor() {
    effect(() => {
      this.state.filteredTransactions();
      setTimeout(() => this.updateCharts(), 100);
    });
  }

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
    this.createPieChart();
    this.createBarChart();
  }

  createPieChart(): void {
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart?.nativeElement?.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;

    const pieData = this.state.filteredCategoryBreakdown().slice(0, 6);
    const selectedCategory = this.state.selectedCategory();

    this.pieChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: pieData.map(([cat]) => cat),
        datasets: [{
          data: pieData.map(([, amt]) => amt),
          backgroundColor: pieData.map(([cat]) => 
            cat === selectedCategory ? '#FBBF24' : ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'][pieData.findIndex(([c]) => c === cat) % 6]
          ),
          borderWidth: 3,
          borderColor: pieData.map(([cat]) => cat === selectedCategory ? '#F59E0B' : '#ffffff'),
          hoverBorderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 25,
              usePointStyle: true
            },
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
  }

  createBarChart(): void {
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    const ctx = this.barChart?.nativeElement?.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;

    this.barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [this.state.filteredTotalIncome(), this.state.filteredTotalExpense()],
          backgroundColor: ['#10B981', '#EF4444'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  updateCharts(): void {
    this.createPieChart();
    this.createBarChart();
  }
}
