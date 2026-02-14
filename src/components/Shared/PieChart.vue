<template>
    <div class="w-full h-full flex justify-center items-center">
      <canvas ref="chartCanvas" style="max-width: 500px; max-height: 500px;"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  import { Chart, registerables } from 'chart.js';
  
  // Registrar todos los componentes de Chart.js
  Chart.register(...registerables);
  
  // Props para recibir datos y opciones
  const props = defineProps({
    labels: {
      type: Array,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    colors: {
      type: Array,
      required: true,
    },
    legendPosition: {
      type: String,
      default: 'top', // Posiciones disponibles: 'top', 'bottom', 'left', 'right'
    },
    showPercentage: {
      type: Boolean,
      default: true, // Muestra los valores en porcentajes en los tooltips
    },
  });
  
  // Referencia al canvas del gráfico
  const chartCanvas = ref(null);
  let chartInstance = null;
  
  // Función para inicializar el gráfico
  const createChart = () => {
    if (chartInstance) {
      chartInstance.destroy(); // Destruir el gráfico anterior si existe
    }
  
    chartInstance = new Chart(chartCanvas.value, {
      type: 'pie', // Tipo de gráfico
      data: {
        labels: props.labels,
        datasets: [
          {
            data: props.data,
            backgroundColor: props.colors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: props.legendPosition, // Posición de la leyenda personalizable
            labels: {
              font: {
                size: 12, // Tamaño de fuente de la leyenda
                weight: 'bold',
              },
              padding: 15,
              color: '#333', // Color del texto
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return props.showPercentage
                  ? `${label}: ${value} (${percentage}%)`
                  : `${label}: ${value}`;
              },
            },
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 14,
              weight: 'bold',
            },
            formatter: (value, ctx) => {
              let total = ctx.dataset.data.reduce((sum, val) => sum + val, 0);
              let percentage = ((value / total) * 100).toFixed(1);
              return props.showPercentage ? `${percentage}%` : value;
            },
          },
        },
      },
    });
  };
  
  // Crear el gráfico al montar el componente
  onMounted(createChart);
  
  // Actualizar el gráfico si cambian las props
  watch(() => [props.labels, props.data, props.colors], createChart);
  
  // Limpiar el gráfico al desmontar el componente
  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
  </script>
  
  