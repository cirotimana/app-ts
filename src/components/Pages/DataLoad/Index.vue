<template>
  <div class="grid grid-cols-1 gap-6">
    <!-- Columna superior (UploadExcel y ConciliationData) -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Columna izquierda -->
      <div class="col-span-2 flex flex-col gap-6">
        <UploadExcel />
        <ConciliationData />
      </div>

      <!-- Columna derecha -->
      <div class="col-span-3">
        <RecentUpload />
      </div>
    </div>

    <!-- ConciliationTable ocupa todo el ancho -->
    <div>
      <ConciliationTable />
    </div>
  </div>
</template>

<script setup>
// Importar los componentes necesarios
import UploadExcel from "./UploadExcel.vue";
import RecentUpload from "./RecentUpload.vue";
import ConciliationData from "./ConciliationData.vue";
import ConciliationTable from "./ConciliationTable.vue";
</script>