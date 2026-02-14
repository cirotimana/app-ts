<template>
  <header class="flex items-center justify-between px-6 py-4 bg-gray-50">
    <!-- Botón para abrir el sidebar -->
    <div class="flex items-center">
      <button class="text-gray-500 focus:outline-none lg:hidden" @click="isOpen = true">
        <BxMenuAltRight class="w-8 h-8" />
      </button>
    </div>

    <!-- Mensaje de bienvenida -->
    <div class="text-center">
      <h1 class="text-lg font-semibold text-gray-700">Bienvenido, {{ userName }}</h1>
    </div>

    <!-- Menú de usuario -->
    <div class="flex items-center">
      <div class="relative">
        <button class="relative z-10 block w-8 h-8 overflow-hidden rounded-full shadow focus:outline-none"
          @click="dropdownOpen = !dropdownOpen">
          <img class="object-cover w-full h-full" src="https://picsum.photos/200" alt="Your avatar">
        </button>

        <div v-if="dropdownOpen" class="fixed inset-0 z-10 w-full h-full" @click="dropdownOpen = false" />

        <transition enter-active-class="transition duration-150 ease-out transform"
          enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in transform" leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0">
          <div v-if="dropdownOpen" class="absolute right-0 z-20 w-48 py-2 mt-2 bg-white rounded-md shadow-xl">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-800 hover:text-white">Perfil</a>
            <a href="#" @click="handleLogout" class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-800 hover:text-white">Logout</a>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
// Importaciones necesarias
import { ref } from 'vue';
import { useSidebar } from '../../composables/useSidebar.js';
import { BxMenuAltRight } from '@kalimahapps/vue-icons';
import { useAuth } from "../../composables/useAuth";
import { useRouter } from "vue-router";

// Estado para el dropdown del menú de usuario
const dropdownOpen = ref(false);

// Estado del sidebar
const { isOpen } = useSidebar();

// Función de autenticación
const { logout, getUser } = useAuth(); // Se asume que `getUser` devuelve la información del usuario actual
const router = useRouter();

// Obtener el nombre del usuario
const userName = ref(getUser()?.name || "Usuario"); // Si no hay usuario, mostrar "Usuario"

// Función para manejar el logout
const handleLogout = async (event) => {
  event.preventDefault();
  try {
    await logout();
    router.push("/login");
    // console.log("Logout ok");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>