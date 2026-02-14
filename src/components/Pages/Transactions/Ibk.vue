<template>
  <div class="flex justify-between items-center my-4">
    <!-- Campo de búsqueda -->
    <input v-model="searchTerm" type="text" placeholder="Buscar por beneficiario"
      class="w-1/4 px-3 py-2 border border-gray-300 rounded-md" @input="fetchFilteredData" />

    <div class="flex items-center space-x-4">
      <!-- Campo para la fecha de inicio -->
      <input v-model="startDate" type="date" placeholder="Fecha de inicio"
        class="px-3 py-2 border border-gray-300 rounded-md" @input="fetchFilteredData" />

      <!-- Campo para la fecha de fin -->
      <input v-model="endDate" type="date" placeholder="Fecha de fin"
        class="px-3 py-2 border border-gray-300 rounded-md" @input="fetchFilteredData" />

      <!-- Filtro para validados -->
      <select v-model="validatedFilter" class="px-8 py-2 border border-gray-300 rounded-md"
        @change="fetchFilteredData">
        <option value="">Todos</option>
        <option value="true">Validados</option>
        <option value="false">No Validados</option>
      </select>

      <!-- Botón para refrescar datos -->
      <button class="bg-indigo-600 px-3 py-2 text-white rounded-md hover:bg-indigo-700"
        @click="() => { resetForm(); fetchTableData(); }">
        <BxRefresh class="text-2xl" />
      </button>

      <!-- Botón para descargar Excel -->
      <button class="bg-green-500 px-3 py-2 text-white rounded-md hover:bg-green-700"
        @click="downloadExcel">
        Descargar Excel
      </button>

    </div>
  </div>

  <!-- Tabla de datos -->
  <TableLite :is-slot-mode="true" :isLoading="tableConfig.isLoading" :title="'IBK Notificaciones'"
    :columns="tableConfig.columns" :rows="filterRows" :pageSize="tableConfig.itemsPerPage"
    :total="tableConfig.totalItems" :page="tableConfig.currentPage" :messages="tableConfig.messages"
    @do-search="handleSearch">
    
    <!-- Slot para estado -->
    <template v-slot:status="data">
      <Switch :value="data.value.status === true" :label="data.value.status ? 'Validado' : 'No Validado'"
        @update:value="(newValue) => handleChangeStatus(data.value.id, newValue ? true : false)" />
    </template>

    <!-- Slot para acciones -->
    <template v-slot:actions="data">
      <button class="px-2 py-1" @click="openModal(data.value.id)">
        <BxMessageAltDetail
          :class="{ 'text-gray-500': !data.value.observations, 'text-yellow-500': data.value.observations }"
          class="text-lg" />
      </button>
    </template>
  </TableLite>

  <!-- Modal -->
  <Modal v-model="isModalVisible" :title="'Add Observations'">
    <form @submit.prevent="handleSubmit">
      <div class="grid">
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium">Observations</label>
          <input v-model="observations" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-md"
            required />
        </div>
      </div>

      <div class="flex justify-end">
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { useTable } from "../../../composables/useTable";
import { getIbks, changeStatus, addObservations } from "../../../api/ibkApi";
import { BxMessageAltDetail, BxRefresh } from '@kalimahapps/vue-icons';
import { formatDateTime } from "../../../utils/dateFormatter";
import TableLite from "../../Shared/TableLite.vue";
import { onMounted, ref, computed } from "vue";
import Switch from "../../Shared/Switch.vue";
import Modal from '../../Shared/Modal.vue';
import * as XLSX from 'xlsx';
import { format } from "date-fns";

const initialColumns = [
  { label: "ID", field: "id", sortable: true, width: "5%" },
  { label: "#Operacion", field: "number_application", sortable: true, width: "10%" },
  { label: "Cliente", field: "beneficiary", sortable: true, width: "25%", columnClasses: ["text-green-500"] },
  { label: "Fecha de Correo", field: "date_time", sortable: true, width: "15%", display: (row) => formatDateTime(row.date_time) },
  { label: "Numero de Cuenta", field: "account_destination", width: "15%", sortable: true },
  { label: "Monto", field: "amount", sortable: true, width: "5%" },
  { label: "Estado", field: "status", width: "15%", columnClasses: ["text-center"] },
  { label: "Acciones", field: "actions", width: "10%", columnClasses: ["text-center"] },
];

const { tableConfig, fetchTableData } = useTable(getIbks, initialColumns);

// Variables
const searchTerm = ref("");
const currentIbkId = ref(null);
const observations = ref("");
const startDate = ref("");
const endDate = ref("");
const validatedFilter = ref(""); // Nueva variable para el filtro de validados

// Modal
const isModalVisible = ref(false);

// Filtrar filas
const filterRows = computed(() => {
  return tableConfig.rows.filter((x) => {
    const matchesSearch = x.beneficiary.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesValidated = validatedFilter.value === "" || 
      x.status === (validatedFilter.value === "true");
    return matchesSearch && matchesValidated;
  });
});

// Resetear los campos del formulario
const resetForm = () => {
  searchTerm.value = "";
  startDate.value = "";
  endDate.value = "";
  validatedFilter.value = ""; // Reiniciar el filtro de validados
};

// Función para manejar la paginación
const handleSearch = async (offset, limit, sort, order) => {
  const page = offset / limit + 1;

  const validatedValue = validatedFilter.value === "true" ? "true" :
                          validatedFilter.value === "false" ? "false" :
                          "";

  tableConfig.currentPage = page;
  tableConfig.itemsPerPage = limit;
  tableConfig.sortable.order = order || tableConfig.sortable.order;
  tableConfig.sortable.column = sort || tableConfig.sortable.column;

  await fetchTableData({
    page,
    limit,
    sort: tableConfig.sortable.column,
    order: tableConfig.sortable.order,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
    stauts : validatedValue,
  });
};

// Actualización dinámica al buscar
const fetchFilteredData = async () => {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    console.error("La fecha de inicio no puede ser mayor que la fecha de fin.");
    return;
  }

  // Procesar el valor de validatedFilter
  const validatedValue = validatedFilter.value === "true" ? "true" :
                          validatedFilter.value === "false" ? "false" :
                          ""; // Enviar vacío si no hay filtro

  const params = {
    page: 1,
    limit: tableConfig.itemsPerPage,
    sort: tableConfig.sortable.column,
    order: tableConfig.sortable.order,
    search: searchTerm.value || "",
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
    status: validatedValue,
  };

  console.log("parametros de ibk", params);

  tableConfig.currentPage = 1;
  await fetchTableData(params);
};

// Modal functions
const openModal = (id = null) => {
  currentIbkId.value = id;

  const ibk = tableConfig.rows.find((row) => row.id === id);
  if (ibk) {
    observations.value = ibk.observations || '';
  }
  isModalVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await addObservations(currentIbkId.value, observations.value);
    isModalVisible.value = false;
    await fetchTableData(tableConfig.currentPage, tableConfig.itemsPerPage);
  } catch (error) {
    console.error('Error adding observations:', error);
  }
};

// Change status
const handleChangeStatus = async (id, newStatus) => {
  try {
    await changeStatus(id, newStatus);
    await fetchTableData(tableConfig.currentPage, tableConfig.itemsPerPage);
  } catch (error) {
    console.error('Error changing user status:', error);
  }
};

const fetchAllFilteredData = async () => {
  try {
    let allData = []; // Almacenará todos los registros
    let page = 1;
    let limit = Infinity; // Cantidad de registros por página (ajusta según la API)
    let totalItems = Infinity; // Inicializa con un valor alto

    // Procesar el valor de validatedFilter
    const validatedValue = validatedFilter.value === "true" ? "true" :
                          validatedFilter.value === "false" ? "false" :
                          ""; // Enviar vacío si no hay filtro

    // Mientras no se hayan obtenido todos los registros
    while (allData.length < totalItems) {
      const params = {
        page,
        limit,
        sort: tableConfig.sortable.column,
        order: tableConfig.sortable.order,
        search: searchTerm.value,
        startDate: `${startDate.value} 00:00:00.000 -5:00`|| undefined,
        endDate: `${endDate.value} 23:59:59.999 -5:00`|| undefined,
        status: validatedValue|| undefined,
      };

      // Obtener los datos de la página actual
      const response = await getIbks(params);
      const { data, total } = response; // Suponiendo que la API devuelve `data` y `total`

      // Agregar los datos de la página actual al array completo
      allData = [...allData, ...data];

      // Actualizar el total de registros
      totalItems = total;

      // Ir a la siguiente página
      page++;
    }

    return allData; // Devuelve todos los registros combinados
  } catch (error) {
    console.error('Error fetching all filtered data:', error);
    return [];
  }
};

const downloadExcel = async () => {
  try {
    // Obtener todos los datos filtrados
    const allFilteredData = await fetchAllFilteredData();

    // Formatear las fechas en los datos
    const formattedData = allFilteredData.map((row) => {
      return {
        ...row,
        date_time: row.date_time
          ? format(new Date(row.date_time), 'yyyy-MM-dd HH:mm:ss') // Formatear payment_date
          : null,
        created_at: row.created_at
          ? format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss') // Formatear created_at
          : null,
        updated_at: row.updated_at
          ? format(new Date(row.updated_at), 'yyyy-MM-dd HH:mm:ss') // Formatear updated_at
          : null,
        status: row.status ? 'Validado' : 'No validado', // Cambiar status a texto
      };
    });

    // Crear una hoja de trabajo (worksheet) a partir de los datos formateados
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Crear un libro de trabajo (workbook) y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Data');

    // Generar el archivo Excel y descargarlo
    XLSX.writeFile(workbook, 'filtered_at_data.xlsx');
  } catch (error) {
    console.error('Error downloading Excel:', error);
  }
};

// Carga inicial de datos
onMounted(() => {
  fetchTableData();
});
</script>