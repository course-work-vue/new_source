<template>
    <div class="chart-container">
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
  import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Title, Legend } from 'chart.js';
  
  // Регистрация необходимых компонентов Chart.js
  Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Title,
    Legend
  );
  
  export default {
    name: 'ChartComponent',
    props: {
      data: { type: Array, required: true },
      type: { type: String, required: true }  // 'attendance' или 'grades'
    },
    setup(props, { emit }) {
      const canvas = ref(null);
      let chartInstance = null;
  
      const renderChart = () => {
        if (!canvas.value) return;
        if (chartInstance) chartInstance.destroy();
  
        const labels = props.data.map(item => `${item.range[0]}–${item.range[1]}`);
        const values = props.data.map(item => item.count);
  
        chartInstance = new Chart(canvas.value, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: props.type === 'attendance' ? 'Процент посещаемости' : 'Количество студентов',
              data: values
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: props.type === 'attendance'
                  ? 'Распределение посещаемости'
                  : 'Распределение среднего балла'
              },
              tooltip: {
                callbacks: {
                  label(context) {
                    return String(context.parsed.y);
                  }
                }
              },
              legend: { display: false }
            },
            scales: {
              x: { title: { display: true, text: 'Диапазон' } },
              y: { beginAtZero: true, title: { display: true, text: 'Количество' } }
            },
            onClick(evt, elements) {
              if (elements.length) {
                const idx = elements[0].index;
                emit('segment-click', props.data[idx].range);
              }
            }
          }
        });
      };
  
      onMounted(renderChart);
      watch(() => props.data, renderChart, { deep: true });
      onBeforeUnmount(() => {
        if (chartInstance) chartInstance.destroy();
      });
  
      return { canvas };
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: 300px;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
  </style>