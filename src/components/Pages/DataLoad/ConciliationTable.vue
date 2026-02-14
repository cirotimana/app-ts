<script setup>
import { ref, computed, onMounted } from "vue";
import { getallBcpReconciliations, getallIbkReconciliations } from "../../../api/reconciliationApi";
import TableLite from "../../Shared/TableLite.vue";
import Modal from "../../Shared/Modal.vue";
import { formatDateTime } from "../../../utils/dateFormatter";
import { BxRefresh } from "@kalimahapps/vue-icons";
import { FaEye } from "@kalimahapps/vue-icons";
import bcpLogo from "../../../assets/logos/bcp_logo.svg";
import ibkLogo from "../../../assets/logos/ibk_logo.png";

// Variables reactivas para los datos y el estado
const bcpData = ref([]);
const ibkData = ref([]);
const loading = ref(false);
const searchTerm = ref("");
const startDate = ref("");
const endDate = ref("");
const isModalVisible = ref(false);
const currentReconciliation = ref(null);

// Configuración de columnas para la tabla
const columns = [
  { label: "Banco", field: "bank", sortable: true, width: "15%" },
  { label: "Beneficiario", field: "beneficiary", sortable: true, width: "60%" },
  { label: "Monto", field: "amount", sortable: true, width: "15%" },
  { label: "Fecha", field: "date", sortable: true, width: "20%" },
  { label: "Acciones", field: "actions", width: "10%", columnClasses: ["text-center"] },
];

// Variables para la paginación
const currentPage = ref(1); // Página actual
const rowsPerPage = ref(10); // Número de filas por página

// Combinar datos de BCP e IBK para la tabla
const tableRows = computed(() => {
  return [
    ...bcpData.value.map((row) => ({
      bank: "BCP",
      beneficiary: row.nombre_at,
      amount: row.monto_at,
      date: row.fecha_pago_at,
      account: row.nro_cuenta_bcp,
      operationNumber: row.num_op_bcp,
    })),
    ...ibkData.value.map((row) => ({
      bank: "Interbank",
      beneficiary: row.nombre_at,
      amount: row.monto_ibk,
      date: row.fecha_pago_at,
      account: row.nro_cuenta_ibk,
      operationNumber: row.num_op_ibk,
    })),
  ];
});

// Filtrar filas según el término de búsqueda y rango de fechas
const filteredRows = computed(() => {
  return tableRows.value.filter((row) => {
    const matchesSearch = row.beneficiary.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesStartDate = !startDate.value || new Date(row.date) >= new Date(startDate.value);
    const matchesEndDate = !endDate.value || new Date(row.date) <= new Date(endDate.value);
    return matchesSearch && matchesStartDate && matchesEndDate;
  });
});

// Filtrar las filas para mostrar solo las de la página actual
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredRows.value.slice(start, end);
});

// Total de filas después de aplicar los filtros
const totalRows = computed(() => filteredRows.value.length);

// Función para obtener datos de conciliaciones
const fetchData = async () => {
  loading.value = true;
  try {
    const [bcpResponse, ibkResponse] = await Promise.all([
      getallBcpReconciliations(),
      getallIbkReconciliations(),
    ]);

    bcpData.value = Array.isArray(bcpResponse.data) ? bcpResponse.data : [];
    ibkData.value = Array.isArray(ibkResponse.data) ? ibkResponse.data : [];
  } catch (error) {
    console.error("Error al obtener datos de conciliaciones:", error);
    bcpData.value = [];
    ibkData.value = [];
  } finally {
    loading.value = false;
  }
};

// Función para manejar la búsqueda y los filtros
const fetchFilteredData = () => {
  currentPage.value = 1; // Reiniciar a la primera página
};

// Función para restablecer los filtros
const resetFilters = () => {
  searchTerm.value = "";
  startDate.value = "";
  endDate.value = "";
  fetchFilteredData();
};

// Función para abrir el modal con detalles
const openModal = (row) => {
  currentReconciliation.value = row;
  isModalVisible.value = true;
};

// Función para manejar la paginación
const handleSearch = (offset, limit) => {
  currentPage.value = offset / limit + 1;
  rowsPerPage.value = limit; // Actualizar el número de filas por página
};

// Cargar datos al montar el componente
onMounted(fetchData);
</script>

<template>
  <div class="w-full p-6 mt-6 bg-white border border-gray-200 rounded-lg shadow">
    <h5 class="mb-4 text-2xl font-bold text-gray-900">Conciliaciones Pendientes</h5>

    <!-- Filtros de búsqueda y fecha -->
    <div class="flex justify-between items-center my-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Buscar por beneficiario"
        class="w-1/4 px-3 py-2 border border-gray-300 rounded-md"
        @input="fetchFilteredData"
      />
      <div class="flex items-center space-x-4">
        <input
          v-model="startDate"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-md"
          @input="fetchFilteredData"
        />
        <input
          v-model="endDate"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-md"
          @input="fetchFilteredData"
        />
        <button
          class="bg-indigo-600 px-3 py-2 text-white rounded-md hover:bg-indigo-700"
          @click="resetFilters"
        >
          <BxRefresh class="text-2xl" />
        </button>
      </div>
    </div>

    <!-- Tabla con datos -->
    <TableLite
      :is-slot-mode="true"
      :isLoading="loading"
      :title="'Registros sin conciliar'"
      :columns="columns"
      :rows="paginatedRows"
      :pageSize="rowsPerPage"
      :total="totalRows"
      :page="currentPage"
      @do-search="handleSearch"
    >
      <template v-slot:bank="data">
        {{ data.value.bank }}
      </template>
      <template v-slot:beneficiary="data">
        {{ data.value.beneficiary }}
      </template>
      <template v-slot:amount="data">
        {{ data.value.amount }}
      </template>
      <template v-slot:date="data">
        {{ formatDateTime(data.value.date) }}
      </template>
      <template v-slot:actions="data">
        <button class="px-2 py-1" @click="openModal(data.value)">
          <FaEye class="text-lg text-blue-700" />
        </button>
      </template>
    </TableLite>

    <!-- Modal para detalles -->
    <Modal v-model="isModalVisible" :title="'Detalles de Conciliación'" :size="'lg'">
      <div v-if="currentReconciliation" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-indigo-600">
            #Operación: {{ currentReconciliation.operationNumber }}
          </h2>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <div
            v-if="currentReconciliation.bank === 'BCP'"
            class="card p-4 bg-orange-200 text-blue-900 shadow-md rounded-lg"
          >
            <div class="space-y-2">
              <img :src="bcpLogo" alt="Bcp Logo" class="w-28" />
              <h3 class="font-bold text-xl">{{ currentReconciliation.beneficiary }}</h3>
              <p class="font-bold text-lg text-blue-800">Monto: {{ currentReconciliation.amount }}</p>
              <p><strong>Fecha de pago:</strong> {{ formatDateTime(currentReconciliation.date) }}</p>
              <p><strong>Cuenta destino:</strong> {{ currentReconciliation.account }}</p>
            </div>
          </div>
          <div
            v-else
            class="card p-4 bg-slate-100 shadow-md rounded-lg"
          >
            <div class="space-y-2">
              <img :src="ibkLogo" alt="Ibk Logo" class="w-32" />
              <h3 class="font-bold text-xl text-indigo-800 uppercase">
                {{ currentReconciliation.beneficiary }}
              </h3>
              <p class="text-lg font-bold text-slate-800">Monto: {{ currentReconciliation.amount }}</p>
              <p><strong>Fecha de pago:</strong> {{ formatDateTime(currentReconciliation.date) }}</p>
              <p><strong>Número de cuenta:</strong> {{ currentReconciliation.account }}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* Estilos personalizados para la tabla */
</style>