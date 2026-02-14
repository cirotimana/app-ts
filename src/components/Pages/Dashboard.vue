<template>
    <!-- Información de Resumen -->
    <div class="mt-4">
        
        <div class="flex flex-wrap -mx-6">
            <div v-for="(item, index) in summaryData" :key="index" class="w-full px-6 my-1 sm:w-1/2 xl:w-1/3">
                <div class="flex items-center px-5 py-6 bg-gray-50 rounded-md shadow-sm">
                    <div class="p-4 rounded-full shadow-lg bg-white">
                        <img :src="item.img" alt="Logo" class=" w-14" />
                    </div>


                    <div class="mx-5">
                        <h4 class="text-2xl font-semibold text-gray-700">
                            {{ formatWithThousandSeparator(item.amount) }}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="flex justify-end items-center gap-2 bg-gray-200 mt-2 rounded-lg">
    <!-- Campo para la fecha de inicio -->
    <div class="relative">
      <input
        v-model="startDate"
        type="date"
        placeholder="Fecha de inicio"
        class="px-3 py-2 border border-gray-300 rounded-md"
        @input="fetchFilteredData"
      />
    </div>

    <!-- Campo para la fecha de fin -->
    <div class="relative">
      <input
        v-model="endDate"
        type="date"
        placeholder="Fecha de fin"
        class="px-3 py-2 border border-gray-300 rounded-md"
        @input="fetchFilteredData"
      />
    </div>

    <!-- Botón para refrescar datos -->
    <button class="bg-indigo-600 px-3 py-2 text-white rounded-md hover:bg-indigo-700"
        @click="() => {resetForm()}">
        <BxRefresh class="text-2xl" />
    </button>
  </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div v-if="loading" class="col-span-1 md:col-span-2 text-center">
            <p class="text-gray-500">Loading data...</p>
        </div>

        <!-- Gráfico BCP -->
        <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold mb-4 text-orange-600">BCP</h3>
            <Chart v-if="bcpSeries.length" :series-data="bcpSeries[0]?.data" :chart-options="bcpChartOptions" />
            <p v-else class="text-gray-500">No data available for BCP</p>
        </div>

        <!-- Gráfico Interbank -->
        <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold mb-4 text-green-600">Interbank</h3>
            <Chart v-if="ibkSeries.length" :series-data="ibkSeries[0]?.data" :chart-options="ibkChartOptions" />
            <p v-else class="text-gray-500">No data available for Interbank</p>
        </div>


        <!-- Gráfico de Validaciones AT - BCP -->
        <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold mb-4 text-orange-600">Validaciones AT - BCP</h3>
            <apexchart
                v-if="bcpValidationSeries.length"
                type="bar"
                height="350"
                :options="bcpValidationChartOptions"
                :series="bcpValidationSeries"
            />
            <p v-else class="text-gray-500">No hay datos disponibles para validaciones de BCP</p>
        </div>

        <!-- Gráfico de Validaciones AT - Interbank -->
        <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold mb-4 text-green-600">Validaciones AT - Interbank</h3>
            <apexchart
                v-if="ibkValidationSeries.length"
                type="bar"
                height="350"
                :options="ibkValidationChartOptions"
                :series="ibkValidationSeries"
            />
            <p v-else class="text-gray-500">No hay datos disponibles para validaciones de Interbank</p>
        </div>

       <!-- Gráfico de Validaciones BCP - Versión Mejorada -->
        <div class="bg-white rounded-xl shadow-lg p-6 flex flex-col border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-orange-600 flex items-center">
                    Validaciones BCP - AT
                </h3>
                <span class="bg-orange-100 text-orange-800 text-md font-medium px-2.5 py-0.5 rounded-full">
                    {{ bcpData.total_records }} registros
                </span>
            </div>

            <div v-if="bcpData && bcpData.total_records > 0" class="flex flex-col md:flex-row items-center">
                <div class="w-full md:w-1/2">
                    <PieChart
                        :labels="['Validados', 'No Validados']"
                        :data="[bcpData.validated_count, bcpData.not_validated_count]"
                        :colors="['#ef8d41', '#0039a6']"
                        :legendPosition="'bottom'"
                        :showPercentage="true"
                        :animation="true"
                        :hoverEffect="true"
                    />
                </div>
                
                <div class="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                                <span class="font-medium">Validados</span>
                            </div>
                            <span class="font-semibold">
                                {{ bcpData.validated_count }} ({{ bcpData.validated_percentage }}%)
                            </span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-blue-800 mr-2"></div>
                                <span class="font-medium">No Validados</span>
                            </div>
                            <span class="font-semibold">
                                {{ bcpData.not_validated_count }} ({{ bcpData.not_validated_percentage }}%)
                            </span>
                        </div>
                        
                        <div class="pt-3 border-t border-gray-200">
                            <p class="text-sm text-gray-500">Última actualización: {{ formatDate(bcpData.last_update) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-8 text-gray-400">
                <p>No hay datos disponibles</p>
            </div>
        </div>

        <!-- Gráfico de Validaciones Interbank - Versión Mejorada -->
        <div class="bg-white rounded-xl shadow-lg p-6 flex flex-col border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-green-600 flex items-center">
                    Validaciones Interbank - AT
                </h3>
                <span class="bg-green-100 text-green-800 text-md font-medium px-2.5 py-0.5 rounded-full">
                    {{ ibkData.total_records }} registros
                </span>
            </div>

            <div v-if="ibkData && ibkData.total_records > 0" class="flex flex-col md:flex-row items-center">
                <div class="w-full md:w-1/2">
                    <PieChart
                        :labels="['Validados', 'No Validados']"
                        :data="[ibkData.validated_count, ibkData.not_validated_count]"
                        :colors="['#22c433', '#0039a6']"
                        :legendPosition="'bottom'"
                        :showPercentage="true"
                        :animation="true"
                        :hoverEffect="true"
                    />
                </div>
                
                <div class="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span class="font-medium">Validados</span>
                            </div>
                            <span class="font-semibold">
                                {{ ibkData.validated_count }} ({{ ibkData.validated_percentage }}%)
                            </span>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-blue-800 mr-2"></div>
                                <span class="font-medium">No Validados</span>
                            </div>
                            <span class="font-semibold">
                                {{ ibkData.not_validated_count }} ({{ ibkData.not_validated_percentage }}%)
                            </span>
                        </div>
                        
                        <div class="pt-3 border-t border-gray-200">
                            <p class="text-sm text-gray-500">Última actualización: {{ formatDate(ibkData.last_update) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-8 text-gray-400">
                <p>No hay datos disponibles</p>
            </div>
        </div>


        <!-- Gráfico de Total Items - BCP -->
        <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold mb-4 text-orange-600">Total Items - BCP</h3>
        <apexchart
            v-if="bcpTotalItemsSeries.length"
            type="bar"
            height="350"
            :options="bcpTotalItemsChartOptions"
            :series="bcpTotalItemsSeries"
        />
        <p v-else class="text-gray-500">No hay datos disponibles para Total Items - BCP</p>
        </div>

        <!-- Gráfico de Total Items - Interbank -->
        <div v-if="!loading && !error" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold mb-4 text-green-600">Total Items - Interbank</h3>
        <apexchart
            v-if="ibkTotalItemsSeries.length"
            type="bar"
            height="350"
            :options="ibkTotalItemsChartOptions"
            :series="ibkTotalItemsSeries"
        />
        <p v-else class="text-gray-500">No hay datos disponibles para Total Items - Interbank</p>
        </div>



        <!-- Error Message -->
        <div v-if="error" class="col-span-1 md:col-span-2 text-center text-red-500">
            <p>{{ error }}</p>
        </div>
    </div>


</template>

<script setup>

import { getValidationSummaryAt, getMonthlyAmountSums, getBcpDailyAmountsForChart, getIbkDailyAmountsForChart, getBcpValidationSummary, getIbkValidationSummary, getTotalItemsSummary } from '../../api/dashboardApi';
import { formatWithThousandSeparator } from '../../utils/numberFormatter';
import Chart from '../Shared/Chart.vue';
import { onMounted, ref } from 'vue';
import merge from 'lodash/merge';
import VueApexCharts from 'vue3-apexcharts';
import PieChart from '../Shared/PieChart.vue';
import { BxMessageAltDetail, BxRefresh } from '@kalimahapps/vue-icons';


// Registrar el componente ApexCharts
const ApexChart = VueApexCharts;

// Logos
import bcpLogo from '../../assets/logos/bcp_logo.svg';
import IbkLogo from '../../assets/logos/ibk_logo.png';
import AtLogo from '../../assets/logos/at_logo.svg';

// Example Data
import Example from './Example.vue';

// Función para formatear fechas al estilo "04 Mar"
const formatDateToDayMonth = (date) => {
  const options = { day: '2-digit', month: 'short' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

// Variables Reactivas
const summaryData = ref([]);
const bcpSeries = ref([]);
const bcpCategories = ref([]);
const ibkSeries = ref([]);
const ibkCategories = ref([]);
const bcpChartOptions = ref({});
const ibkChartOptions = ref({});
const loading = ref(true);
const error = ref(null);
const bcpData = ref({ total_records: 0, validated_percentage: 0, not_validated_percentage: 0 });
const ibkData = ref({ total_records: 0, validated_percentage: 0, not_validated_percentage: 0 });
const startDate = ref("");
const endDate = ref("");

// Variables Reactivas para Validaciones
const bcpValidationSeries = ref([]);
const bcpValidationChartOptions = ref({
    chart: {
        type: "bar",
        stacked: false,
    },
    xaxis: {
        categories: [],
        title: {
            text: "Fecha",
        },
        labels: {
            style: {
                fontSize: "10px", // Reducir el tamaño de las etiquetas del eje X
            },
            formatter: (value) => formatDateToDayMonth(value), // Formatear las fechas
        },
    },
    yaxis: {
        title: {
            text: "Cantidad de Registros",
        },
        labels: {
            style: {
                fontSize: "10px", // Reducir el tamaño de las etiquetas del eje Y
            },
        },
    },
    plotOptions: {
        bar: {
            columnWidth: "90%", // Aumentar el ancho de las barras
            grouped: true, // Agrupar las barras una al lado de la otra
            borderRadius: 3,
        },
    },
    stroke: {
        width: [0, 0, 2], // Grosor de las líneas (0 para barras, 2 para la línea del total)
        dashArray: [0, 0, 5], // Línea punteada para el total
    },
    markers: {
        size: [0, 0, 4], // Tamaño de los puntos (solo para el total)
        colors: ["#002a8d"], // Color de los puntos para BCP
        strokeColors: "#002a8d", // Color del borde de los puntos
        strokeWidth: 2,
    },
    colors: ["#ef8d41", "#0039a6",  "#000"], // Colores para validados, no validados y total
    dataLabels: {
        enabled: true,
        style: {
            fontSize: "8px", // Reducir el tamaño de las etiquetas de datos
            colors: ["#000"], // Cambiar el color de las etiquetas a negro
        },
        offsetY: -20, // Mover las etiquetas hacia arriba
        formatter: (val, opts) => {
            // Mostrar etiquetas para todas las series
            return val;
        },
    },
    fill: {
        opacity: [1, 1, 0], // Fondo sombreado para las barras, sin relleno para la línea del total
    },
});

const ibkValidationSeries = ref([]);
const ibkValidationChartOptions = ref({
    chart: {
        type: "bar",
        stacked: false,
    },
    xaxis: {
        categories: [],
        title: {
            text: "Fecha",
        },
        labels: {
            style: {
                fontSize: "10px", // Reducir el tamaño de las etiquetas del eje X
            },
            formatter: (value) => formatDateToDayMonth(value), // Formatear las fechas
        },
    },
    yaxis: {
        title: {
            text: "Cantidad de Registros",
        },
        labels: {
            style: {
                fontSize: "10px", // Reducir el tamaño de las etiquetas del eje Y
            },
        },
    },
    plotOptions: {
        bar: {
            columnWidth: "90%", // Aumentar el ancho de las barras
            grouped: true, // Agrupar las barras una al lado de la otra
            borderRadius: 3,
        },
    },
    stroke: {
        width: [0, 0, 2], // Grosor de las líneas (0 para barras, 2 para la línea del total)
        dashArray: [0, 0, 5], // Línea punteada para el total
    },
    markers: {
        size: [0, 0, 4], // Tamaño de los puntos (solo para el total)
        colors: ["#0039a6"], // Color de los puntos para Interbank
        strokeColors: "#0039a6", // Color del borde de los puntos
        strokeWidth: 2,
    },
    colors: ["#22c433", "#0039a6",  "#000"], // Colores para validados, no validados y total
    dataLabels: {
        enabled: true,
        style: {
            fontSize: "8px", // Reducir el tamaño de las etiquetas de datos
            colors: ["#000"], // Cambiar el color de las etiquetas a negro
        },
        offsetY: -20, // Mover las etiquetas hacia arriba
        formatter: (val, opts) => {
            // Mostrar etiquetas para todas las series
            return val;
        },
    },
    fill: {
        opacity: [1, 1, 0], // Fondo sombreado para las barras, sin relleno para la línea del total
    },
});

const formatDate = (date) => {
  return new Date(date).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};



const fetchValidationCorreos = async () => {
    try {
    bcpData.value = await getBcpValidationSummary();
    ibkData.value = await getIbkValidationSummary();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};





// Función para obtener datos del resumen
const fetchSummaryData = async () => {
    try {
        const monthlyData = await getMonthlyAmountSums();
        summaryData.value = [
            {
                amount: monthlyData?.bcpTotalAmount || 0,
                img: bcpLogo,
            },
            {
                amount: monthlyData?.ibkTotalAmount || 0,
                img: IbkLogo,
            },
            {
                amount: monthlyData?.atTotalAmount || 0,
                img: AtLogo,
            },
        ];
    } catch (err) {
        throw new Error('Failed to fetch summary data');
    }
};

// Función para obtener datos de gráficos
const fetchChartData = async () => {
    try {
        const [bcpData, ibkData] = await Promise.all([
            getBcpDailyAmountsForChart(),
            getIbkDailyAmountsForChart(),
        ]);

        if (bcpData?.categories && bcpData?.series) {
            bcpSeries.value = bcpData.series;
            bcpCategories.value = bcpData.categories;

            // Configurar opciones del gráfico BCP
            bcpChartOptions.value = merge({}, bcpChartOptions.value, {
                xaxis: {
                    categories: bcpData.categories,
                    type: 'datetime',
                    labels: {
                        formatter: (value) => formatDateToDayMonth(value), // Formatear las fechas
                    },
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        gradientToColors: ['#ef8d41'],
                    },
                },
                markers: {
                    colors: ['#002a8d'],
                },
                colors: ['#002a8d'],
            });
        }

        if (ibkData?.categories && ibkData?.series) {
            ibkSeries.value = ibkData.series;
            ibkCategories.value = ibkData.categories;

            // Configurar opciones del gráfico Interbank
            ibkChartOptions.value = {
                xaxis: {
                    categories: ibkData.categories,
                    type: 'datetime',
                    labels: {
                        formatter: (value) => formatDateToDayMonth(value), // Formatear las fechas
                    },
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        gradientToColors: ['#22c433'],
                    },
                },
                markers: {
                    colors: ['#0039a6'],
                },
                colors: ['#0039a6'],
            };
        }
    } catch (err) {
        throw new Error('Failed to fetch chart data');
    }
};

// Función para obtener datos de validaciones por día
const fetchValidationData = async () => {
    try {
        const validationData = await getValidationSummaryAt();

        // console.log("Datos devueltos por la API:", validationData); // Depuración

        if (validationData?.categories && validationData?.series) {
            // Procesar datos para BCP
            const bcpData = validationData.series.find((item) => item.name === "BCP");
            if (bcpData) {
                bcpValidationSeries.value = [
                    { name: "Validados", data: bcpData.validated },
                    { name: "No Validados", data: bcpData.notValidated },
                    { name: "Total", data: bcpData.total, type: "area" }, // Fondo sombreado
                ];
                bcpValidationChartOptions.value.xaxis.categories = validationData.categories;
            }

            // Procesar datos para Interbank
            const ibkData = validationData.series.find((item) => item.name === "Interbank");
            if (ibkData) {
                ibkValidationSeries.value = [
                    { name: "Validados", data: ibkData.validated },
                    { name: "No Validados", data: ibkData.notValidated },
                    { name: "Total", data: ibkData.total, type: "area" }, // Fondo sombreado
                ];
                ibkValidationChartOptions.value.xaxis.categories = validationData.categories;
            }
        } else {
            console.warn("La API no devolvió datos válidos para las validaciones."); // Depuración
        }
    } catch (err) {
        console.error("Error al obtener datos de validaciones por día:", err);
    }
};

// Función Principal para Manejar la Carga
const fetchData = async () => {
    loading.value = true;
    error.value = null;

    try {
        await Promise.all([
            fetchSummaryData(),
            fetchChartData(),
            fetchValidationData(), 
            fetchValidationCorreos(),
            fetchTotalItemsData(),
        ]);
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};




///grafica de comparacion correos at

const bcpTotalItemsSeries = ref([]);
const bcpTotalItemsChartOptions = ref({
  chart: {
    type: "bar",
    stacked: false,
    toolbar: {
      show: false // Ocultar herramientas si no son necesarias
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  xaxis: {
    categories: [],
    title: {
      text: "Fecha",
      style: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#333'
      }
    },
    axisBorder: {
      show: true,
      color: '#e0e0e0'
    },
    axisTicks: {
      show: true,
      color: '#e0e0e0'
    },
    labels: {
      style: {
        fontSize: "10px",
        colors: '#666'
      },
      formatter: (value) => formatDateToDayMonth(value),
      trim: true, // Evita que las etiquetas se desborden
      hideOverlappingLabels: true
    },
    tooltip: {
      enabled: false // Desactiva tooltips en el eje X si no son necesarios
    }
  },
  yaxis: {
    title: {
      text: "Cantidad de Registros",
      style: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#333'
      }
    },
    labels: {
      style: {
        fontSize: "10px",
        colors: '#666'
      },
      formatter: (value) => Number.isInteger(value) ? value : value.toFixed(2) // Mejor formato para números
    },
    min: 0, // Siempre empezar desde 0 en gráficos de barras
    forceNiceScale: true // Mejor distribución de los valores
  },
  plotOptions: {
    bar: {
      columnWidth: "90%",
      borderRadius: 3, // Bordes ligeramente redondeados
      dataLabels: {
        position: 'top' // Posición más natural para las etiquetas
      },
      distributed: false // Cambiar a true si quieres que cada barra tenga su propio color
    }
  },
  colors: ["#ef8d41", "#0039a6"],
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 400,
      colors: ['#000000']
    },
    offsetY: -20,
    dropShadow: {
      enabled: false
    },
    background: {
      enabled: false
    },
    formatter: (val) => val || '' // Manejo de valores falsy
  },
  legend: {
    position: "top",
    horizontalAlign: "center",
    fontSize: '12px',
    itemMargin: {
      horizontal: 10,
      vertical: 5
    },
    markers: {
      width: 12,
      height: 12,
      radius: 6
    }
  },
    grid: {
        show: true,
        borderColor: '#f0f0f0',
        strokeDashArray: 3,
        position: 'back',
        xaxis: {
        lines: {
            show: false
        }
        },
        yaxis: {
        lines: {
            show: true
        }
        }
    },
    tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        style: {
            fontSize: '12px'
        },
        y: {
            formatter: (value) => `${value} registros`
        }
    },
    responsive: [{
        breakpoint: 600,
        options: {
            plotOptions: {
                bar: {
                    columnWidth: '70%'
                }
            },
            dataLabels: {
                enabled: false // Ocultar etiquetas en móviles
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
});

const ibkTotalItemsSeries = ref([]);
const ibkTotalItemsChartOptions = ref({
  chart: {
    type: "bar",
    stacked: false,
    toolbar: {
      show: false // Ocultar herramientas si no son necesarias
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  xaxis: {
    categories: [],
    title: {
      text: "Fecha",
      style: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#333'
      }
    },
    axisBorder: {
      show: true,
      color: '#e0e0e0'
    },
    axisTicks: {
      show: true,
      color: '#e0e0e0'
    },
    labels: {
      style: {
        fontSize: "10px",
        colors: '#666'
      },
      formatter: (value) => formatDateToDayMonth(value),
      trim: true, // Evita que las etiquetas se desborden
      hideOverlappingLabels: true // Oculta etiquetas superpuestas
    },
    tooltip: {
      enabled: false // Desactiva tooltips en el eje X si no son necesarios
    }
  },
  yaxis: {
    title: {
      text: "Cantidad de Registros",
      style: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#333'
      }
    },
    labels: {
      style: {
        fontSize: "10px",
        colors: '#666'
      },
      formatter: (value) => Number.isInteger(value) ? value : value.toFixed(2) // Mejor formato para números
    },
    min: 0, // Siempre empezar desde 0 en gráficos de barras
    forceNiceScale: true // Mejor distribución de los valores
  },
  plotOptions: {
    bar: {
      columnWidth: "90%",
      borderRadius: 3, // Bordes ligeramente redondeados
      dataLabels: {
        position: 'top' // Posición más natural para las etiquetas
      },
      distributed: false // Cambiar a true si quieres que cada barra tenga su propio color
    }
  },
  colors: ["#22c433", "#0039a6"], // Colores con buen contraste
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 400,
      colors: ['#000000']
    },
    offsetY: -20,
    dropShadow: {
      enabled: false
    },
    background: {
      enabled: false
    },
    formatter: (val) => val || '' // Manejo de valores falsy
  },
  legend: {
    position: "top",
    horizontalAlign: "center",
    fontSize: '12px',
    itemMargin: {
      horizontal: 10,
      vertical: 5
    },
    markers: {
      width: 12,
      height: 12,
      radius: 6
    }
  },
  grid: {
    show: true,
    borderColor: '#f0f0f0',
    strokeDashArray: 3,
    position: 'back',
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,
    style: {
      fontSize: '12px'
    },
    y: {
      formatter: (value) => `${value} registros`
    }
  },
  responsive: [{
    breakpoint: 600,
    options: {
      plotOptions: {
        bar: {
          columnWidth: '70%'
        }
      },
      dataLabels: {
        enabled: false // Ocultar etiquetas en móviles
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
});

const fetchTotalItemsData = async () => {
  try {
    const totalItemsData = await getTotalItemsSummary();

    if (totalItemsData?.categories && totalItemsData?.series) {
      // Procesar datos para BCP
      const bcpData = totalItemsData.series.find((item) => item.name === "BCP");
      if (bcpData) {
        bcpTotalItemsSeries.value = [
          { name: "Total AT", data: bcpData.totalAT },
          { name: "Total Correos", data: bcpData.totalCorreos },
        ];
        bcpTotalItemsChartOptions.value.xaxis.categories = totalItemsData.categories;
      }

      // Procesar datos para Interbank
      const ibkData = totalItemsData.series.find((item) => item.name === "Interbank");
      if (ibkData) {
        ibkTotalItemsSeries.value = [
          { name: "Total AT", data: ibkData.totalAT },
          { name: "Total Correos", data: ibkData.totalCorreos },
        ];
        ibkTotalItemsChartOptions.value.xaxis.categories = totalItemsData.categories;
      }
    }
  } catch (err) {
    console.error("Error al obtener datos de Total Items:", err);
  }
};



///filtros:

// Resetear los campos del formulario
const resetForm = () => {
  startDate.value = "";
  endDate.value = "";
  fetchData();
};


const fetchFilteredData = async () => {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    console.error("La fecha de inicio no puede ser mayor que la fecha de fin.");
    return;
  }

  try {
    loading.value = true;
    
    // Construir query params correctamente
    const params = new URLSearchParams();
    if (startDate.value) params.append('startDate', `${startDate.value} 00:00:00.000 -5:00`);
    if (endDate.value) params.append('endDate', `${endDate.value} 23:59:59.999 -5:00`);

    const queryString = params.toString();
    
    // Obtener todos los datos con los filtros
    const [
      bcpValidation, 
      ibkValidation,
      validationSummary,
      bcpDailyAmounts,
      ibkDailyAmounts,
      totalItemsSummary
    ] = await Promise.all([
      getBcpValidationSummary(queryString),
      getIbkValidationSummary(queryString),
      getValidationSummaryAt(queryString),
      getBcpDailyAmountsForChart(queryString),
      getIbkDailyAmountsForChart(queryString),
      getTotalItemsSummary(queryString)
    ]);
    
    // Asignar los resultados
    bcpData.value = bcpValidation;
    ibkData.value = ibkValidation;
    
    // Procesar validationSummary 
    if (validationSummary?.categories && validationSummary?.series) {
      const bcpData = validationSummary.series.find(item => item.name === "BCP");
      if (bcpData) {
        bcpValidationSeries.value = [
          { name: "Validados", data: bcpData.validated },
          { name: "No Validados", data: bcpData.notValidated },
          { name: "Total", data: bcpData.total, type: "area" }
        ];
        bcpValidationChartOptions.value.xaxis.categories = validationSummary.categories;
      }

      const ibkData = validationSummary.series.find(item => item.name === "Interbank");
      if (ibkData) {
        ibkValidationSeries.value = [
          { name: "Validados", data: ibkData.validated },
          { name: "No Validados", data: ibkData.notValidated },
          { name: "Total", data: ibkData.total, type: "area" }
        ];
        ibkValidationChartOptions.value.xaxis.categories = validationSummary.categories;
      }
    }

    // Procesar datos para gráficos diarios
    if (bcpDailyAmounts?.categories && bcpDailyAmounts?.series) {
      bcpSeries.value = bcpDailyAmounts.series;
      bcpCategories.value = bcpDailyAmounts.categories;
      bcpChartOptions.value.xaxis.categories = bcpDailyAmounts.categories;
    }

    if (ibkDailyAmounts?.categories && ibkDailyAmounts?.series) {
      ibkSeries.value = ibkDailyAmounts.series;
      ibkCategories.value = ibkDailyAmounts.categories;
      ibkChartOptions.value.xaxis.categories = ibkDailyAmounts.categories;
    }

        // Procesar los datos de Total Items
    if (totalItemsSummary?.categories && totalItemsSummary?.series) {
      const bcpData = totalItemsSummary.series.find((item) => item.name === "BCP");
      if (bcpData) {
        bcpTotalItemsSeries.value = [
          { name: "Total AT", data: bcpData.totalAT },
          { name: "Total Correos", data: bcpData.totalCorreos },
        ];
        bcpTotalItemsChartOptions.value.xaxis.categories = totalItemsSummary.categories;
      }

      const ibkData = totalItemsSummary.series.find((item) => item.name === "Interbank");
      if (ibkData) {
        ibkTotalItemsSeries.value = [
          { name: "Total AT", data: ibkData.totalAT },
          { name: "Total Correos", data: ibkData.totalCorreos },
        ];
        ibkTotalItemsChartOptions.value.xaxis.categories = totalItemsSummary.categories;
      }
    }

  } catch (err) {
    error.value = `Error al cargar datos: ${err.message}`;
    console.error('Error fetching filtered data:', err);
  } finally {
    loading.value = false;
  }
};

// Ejecutar al montar el componente
onMounted(fetchData);
</script>
