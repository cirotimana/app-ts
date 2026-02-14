<template>
  <div class="w-full p-6 text-center bg-white border border-gray-200 rounded-lg shadow">
    <h5 class="mb-2 text-2xl font-bold text-gray-900">Conciliacion de Datos</h5>
    <div class="w-full py-9 bg-gray-50 rounded-xl border border-gray-300 border-dashed relative flex flex-col items-center justify-center">
      <p class="mb-5 text-base text-gray-500 sm:text-lg">
        Por favor, asegúrese de cargar los datos necesarios antes de proceder con el proceso de conciliación.
      </p>
      
      <button
        @click="handleConciliation"
        :disabled="loading"
        class="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Procesando...' : 'Conciliar Datos' }}
      </button>
    </div>
    
    <Toast ref="toast" />
  </div>
</template>

<script setup>

import { ref } from 'vue';
import Toast from "../../Shared/Toast.vue";
import { conciliationBcp, conciliationIbk } from "../../../api/reconciliationApi"; 

const toast = ref(null);


const loading = ref(false);

const handleConciliation = async () => {
  loading.value = true; 

  try {
    
    const [resultBcp, resultIbk] = await Promise.all([
      conciliationBcp(),
      conciliationIbk(),
    ]);

    
    let message = '';
    let type = 'info'; 

    if (resultBcp.success && resultIbk.success) {
      message = 'Conciliación realizada con éxito para BCP e Interbank';
      type = 'success';
    }
    
    else if (resultBcp.success) {
      message = 'Conciliación realizada con éxito para BCP';
      type = 'success';
    }
    
    else if (resultIbk.success) {
      message = 'Conciliación realizada con éxito para Interbank';
      type = 'success';
    }
    
    else {
      message = 'No se pudo realizar la conciliación en BCP ni en Interbank por falta de datos';
    }

    
    toast.value.showToast(message, type);
  } catch (error) {
    
    toast.value.showToast('Error al realizar la conciliación', 'error');
    console.error('Error en handleConciliation:', error);
  } finally {
    loading.value = false; 
  }
};
</script>

<style scoped>

button {
  transition: background-color 0.3s ease;
}
</style>