import { Component, inject, AfterViewInit, ViewChild, ElementRef, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="text-sm opacity-90">Total Balance</div>
\${{ state.filteredTotalBalance() | number:'1.2-2' }}
        </div>
        <div class="bg-gradient-to-br from-green-400 to-green-500 text-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="text-sm opacity-90">Total Income</div>
          <div class="text-3xl font-bold mt-1">\${{ state.totalIncome() | number:'1.2-2' }}</div>
        </div>
        <div class="bg-gradient-to-br from-red-400 to-red-500 text-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="text-sm opacity-90">Total Expenses</div>
          <div class="text-3xl font-bold mt-1">\${{ state.totalExpense() | number:'1.2-2' }}</div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Balance Growth Chart -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
          <h3 class="text-2xl font-bold mb-8 text-gray-900 dark:text-white">📈 Balance Growth</h3>
          <div class="aspect-[3/2] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6">
            <canvas #trendChart class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Pie Chart -->
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
          <h3 class="text-2xl font-bold mb-8 text-gray-900 dark:text-white">📊 Spending Breakdown</h3>
          <div class="h-80 flex items-center justify-center">
            <canvas #pieChart class="max-h-full w-auto"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    canvas { max-height: 100%; }
  `]
})
export class DashboardOverviewComponent implements AfterViewInit {
  readonly state = inject(StateService);

  @ViewChild('trendChart', { static: false }) trendChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart', { static: false }) pieChart!: ElementRef<HTMLCanvasElement>;

  private trendChartInstance: any = null;
  private pieChartInstance: any = null;

  constructor() {
    effect(() => {
      this.state.transactions();
      setTimeout(() => this.updateCharts(), 100);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 200);
  }

  initCharts() {
    this.createTrendChart();
    this.createPieChart();
  }

  createTrendChart(): void {
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    const ctx = this.trendChart?.nativeElement?.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;

    const txs = this.state.transactions()
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let balance = 12000;
    const points: { label: string; value: number }[] = [];

    txs.slice(-25).forEach(tx => { // Last 25 for smooth recent trend
      balance += tx.type === 'income' ? tx.amount : -tx.amount;
      const date = new Date(tx.date);
      const label = date.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric' 
      });
      points.push({ label, value: Math.max(5000, balance) });
    });

    // Limit to 12 points
    const stepSize = Math.ceil(points.length / 12);
    const trendData = points.filter((_, i) => i % stepSize === 0 || i === points.length - 1);

    this.trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.map(p => p.label),
        datasets: [{
          label: 'Running Balance',
          data: trendData.map(p => p.value),
          borderColor: '#10B981',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return null;
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            return gradient;
          },
          tension: 0.4,
          fill: true,
          borderWidth: 4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10B981',
          pointBorderWidth: 3,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointHoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: {
              callback: (value: number) => '$' + value.toLocaleString()
            }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              label: (ctx: any) => `Balance: $${ctx.parsed.y?.toLocaleString() || 0}`
            }
          }
        },
        animation: {
          duration: 2500
        }
      }
    });
  }

  createPieChart(): void {
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    const ctx = this.pieChart?.nativeElement?.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;

    const categories = this.state.categoryBreakdown().slice(0, 6);

    this.pieChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.map(([cat]) => cat),
        datasets: [{
          data: categories.map(([, amt]) => amt),
          backgroundColor: [
            '#EF4444', '#F59E0B', '#10B981', 
            '#3B82F6', '#8B5CF6', '#EC4899'
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
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
              usePointStyle: true,
              generateLabels: function(chart: any) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map(function(label: string, i: number) {
                    const value = data.datasets[0].data[i];
                    const total = data.datasets[0].data.reduce(function(a: number, b: number) {
                      return a + b;
                    }, 0);
                    const percentage = Math.round((value/total)*100);
                    return {
                      text: label + ': $' + value.toLocaleString() + ' (' + percentage + '%)',
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: '#fff',
                      lineWidth: 2,
                      pointStyle: 'circle'
                    };
                  });
                }
                return [];
              }
            },
            onClick: (e: any, elements: any[], chart: any) => {
              const index = elements[0]?.index;
              if (index !== undefined) {
                const category = categories[index][0];
                this.state.selectedCategory.set(category);
              }
            }
          }
        }
      }
    });
  }

  updateCharts(): void {
    this.createTrendChart();
    this.createPieChart();
  }
}

