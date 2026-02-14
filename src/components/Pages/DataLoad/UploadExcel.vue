<template>
    <div class="w-full p-6 text-center bg-white border border-gray-200 rounded-lg shadow">
        <h5 class="mb-2 text-2xl font-bold text-gray-900">Carga de datos</h5>
        <p class="mb-5 text-base text-gray-500 sm:text-lg">Por favor, cargue un archivo en formato .xlsx.</p>

        <div id="dropzone"
            class="w-full py-9 bg-gray-50 rounded-xl border border-gray-300 border-dashed relative flex flex-col items-center justify-center"
            :class="{ 'border-blue-600 bg-blue-50': isDragging }" @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
            <FaFileExcel class="text-green-500 text-4xl" />
            <h2 class="text-center text-gray-400 text-xs leading-4 my-4">XLSX, Peso Max. 2MB</h2>

            <label class="mt-4 cursor-pointer">
                <input ref="fileInput" type="file" class="hidden" accept=".xlsx, .xls" @change="handleFileChange">
                <div class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700"> 
                    Elija el Archivo
                </div>
            </label>
        </div>

        <div v-if="file !== null" class="mt-4 p-4 bg-white rounded-lg shadow">
            <p class="text-sm text-green-600">File: {{ file.name }} ({{ formatBytes(file.size) }})</p>
            <button @click="handleSubmit" :disabled="isLoading || !isFileValid"
                class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:opacity-50">
                {{ isLoading ? "Subiendo..." : "Subir el archivo" }}
            </button>
            <p v-if="!isFileValid" class="text-red-500 text-sm mt-2">               
                Tipo de archivo no válido. Seleccione un archivo .xlsx o .xls.
            </p>
        </div>

        <Toast ref="toast" />

    </div>


</template>

<script setup>
import { ref } from "vue";
import emitter from "../../../eventBus";
import Toast from "../../Shared/Toast.vue";
import { uploadFile } from "../../../api/uploadApi";
import { FaFileExcel } from "@kalimahapps/vue-icons";
import { formatBytes } from "../../../utils/fileFormatter";
import Swal from 'sweetalert2';

const file = ref(null);
const isLoading = ref(false);
const isDragging = ref(false);
const allowedExtensions = [".xlsx", ".xls"];
const isFileValid = ref(false);
const toast = ref(null);
const fileInput = ref(null);

const showSuccessToast = () => {
    toast.value.showToast('Operacion Exitosa!', 'success');
};

const showErrorToast = () => {
    toast.value.showToast('Errorrrrr', 'error');
};

const validateFile = (file) => {
    const fileExtension = file.name.slice(file.name.lastIndexOf("."));
    isFileValid.value = allowedExtensions.includes(fileExtension);
};

const handleFileChange = (event) => {
    file.value = event.target.files[0];
    validateFile(file.value);
};

const handleDrop = (event) => {
    file.value = event.dataTransfer.files[0];
    validateFile(file.value);
    isDragging.value = false;
};

const handleDragOver = () => {
    isDragging.value = true;
};

const handleDragLeave = () => {
    isDragging.value = false;
};

// const handleSubmit = async () => {
//     if (!file.value || !isFileValid.value) {
//         return;
//     }

//     try {
//         isLoading.value = true;
//         const response = await uploadFile(file.value);
//         showSuccessToast();
//         emitter.emit("file-uploaded");
//     } catch (error) {
//         showErrorToast();
//     } finally {
//         resetFile();
//     }
// };



// Function to reset the file state

const handleSubmit = async () => {
  if (!file.value || !isFileValid.value) return;

  try {
    isLoading.value = true;
    const response = await uploadFile(file.value);

    switch (response.status) {
      case "all_new":
        Swal.fire({
          icon: "success",
          title: "Exito",
          text: "Todos los registros se subieron con exito.",
        });
        break;
      case "some_existing":
        Swal.fire({
          icon: "warning",
          title: "Alerta",
          text: "Se subieron los nuevos registros. Algunos registros ya existian.",
        });
        break;
      case "all_existing":
        Swal.fire({
          icon: "error",
          title: "Duplicados",
          text: "Todos los registros ya existen. No se subio ningun registro.",
        });
        break;
      case "error":
      default:
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al procesar el archivo.",
        });
        break;
    }

    emitter.emit("file-uploaded");
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error de red",
      text: "Error de red al subir archivo.",
    });
  } finally {
    resetFile();
    isLoading.value = false;
  }
};


const resetFile = () => {
    file.value = null;
    isFileValid.value = false;
    isLoading.value = false;
    fileInput.value.value && (fileInput.value.value = null);
};

</script>
