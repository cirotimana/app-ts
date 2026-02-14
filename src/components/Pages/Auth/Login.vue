<template>
  <div class="flex items-center justify-center p-6 min-h-screen bg-indigo-800">
    <div class="w-full max-w-md p-6">
      <form class="mt-8 bg-white rounded-lg shadow-xl overflow-hidden" @submit.prevent="handleLogin">
        <div class="px-10 py-12">
          <!-- Logo centrado -->
          <div class="flex items-center justify-center">
            <img :src="logo" alt="Logo" class="h-10 w-auto" />
          </div>
          <div class="my-8 mx-auto w-24 border-b-2" />

          <!-- Campo de email -->
          <div class="mb-4">
            <label class="block">
              <span class="text-sm text-gray-700">Email</span>
              <input
                v-model="email"
                type="email"
                class="block w-full mt-1 border-gray-200 rounded-md focus:border-indigo-600 focus:ring focus:ring-opacity-40 focus:ring-indigo-500"
                :class="{ 'border-red-500': emailError }"
                placeholder="Ingresa tu correo"
              />
              <span v-if="emailError" class="text-sm text-red-500">{{ emailError }}</span>
            </label>
          </div>

          <!-- Campo de contraseña -->
          <div class="mb-4">
            <label class="block mt-3">
              <span class="text-sm text-gray-700">Password</span>
              <input
                v-model="password"
                type="password"
                class="block w-full mt-1 border-gray-200 rounded-md focus:border-indigo-600 focus:ring focus:ring-opacity-40 focus:ring-indigo-500"
                :class="{ 'border-red-500': passwordError }"
                placeholder="Ingresa tu contraseña"
              />
              <span v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</span>
            </label>
          </div>

          <!-- Botón de login -->
          <div class="flex px-10 py-4 bg-gray-100 border-t border-gray-100 justify-end">
            <button
              type="submit"
              class="w-1/2 px-4 py-2 text-sm text-center text-white bg-indigo-600 rounded-md focus:outline-none hover:bg-indigo-500"
            >
              Login
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../../composables/useAuth";
import logo from "../../../assets/logos/logo.png";


const router = useRouter();
const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");
const { login } = useAuth();

// funcion para manejar el inicio de sesion
const handleLogin = async () => {

  emailError.value = "";
  passwordError.value = "";

  if (!email.value) {
    emailError.value = "El correo es obligatorio.";
  } else if (!isValidEmail(email.value)) {
    emailError.value = "El correo no tiene un formato válido.";
  }

  if (!password.value) {
    passwordError.value = "La contraseña es obligatoria.";
  }

  
  if (emailError.value || passwordError.value) {
    return;
  }


  try {
    await login(email.value, password.value);
    router.push("/");
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    emailError.value = "Correo o contraseña incorrectos.";
  }
};

/////validamos el correo
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
</script>