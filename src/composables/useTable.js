import { format, subDays, startOfDay, endOfDay } from 'date-fns'; // Importar funciones adicionales de date-fns
import { reactive } from "vue";

export function useTable(fetchDataFn, initialColumns = []) {
  const tableConfig = reactive({
    isLoading: false,
    columns: initialColumns,
    rows: [],
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    sortable: {
      order: "desc",
      column: "id",
    },
    messages: {
      pagingInfo: "Mostrando {0}-{1} de {2} resultados",
      pageSizeChangeLabel: " Páginas por:",
      gotoPageLabel: "Ir a la página",
      noDataAvailable: "No hay datos disponibles",
    },
  });

  const fetchTableData = async (params = {}) => {
    tableConfig.isLoading = true;

    // Fechas por defecto ajustadas al inicio y final del día
    const today = new Date();
    const startOfToday = startOfDay(today); // Inicio del día actual
    const endOfToday = endOfDay(today); // Final del día actual
    const sevenDaysAgo = subDays(startOfToday, 7); // Hace 7 días desde el inicio del día actual

    // Ajustar las fechas proporcionadas o usar las fechas por defecto
    const formatWithTimezone = (date) => {
      const offset = -new Date().getTimezoneOffset() / 60; // Obtener la zona horaria en horas
      const timezone = offset >= 0 ? `+${String(offset).padStart(2, "0")}:00` : `${String(offset).padStart(2, "0")}:00`;
      return `${format(date, "yyyy-MM-dd HH:mm:ss.SSS")} ${timezone}`;
    };

    const startDate = params.startDate
      ? formatWithTimezone(startOfDay(new Date(`${params.startDate}T00:00:00`)))
      : formatWithTimezone(sevenDaysAgo);

    const endDate = params.endDate
      ? formatWithTimezone(endOfDay(new Date(`${params.endDate}T23:59:59`)))
      : formatWithTimezone(endOfToday);

    try {
      const response = await fetchDataFn({
        page: params.page || tableConfig.currentPage,
        limit: params.limit || tableConfig.itemsPerPage,
        sort: params.sort || tableConfig.sortable.column,
        order: params.order || tableConfig.sortable.order,
        startDate,
        endDate,
        search: params.search,
        validated: params.validated,
        status: params.status,
      });

      tableConfig.rows = response.data;
      tableConfig.totalItems = response.totalItems;

      console.log("Datos de tabla obtenidos:", { startDate, endDate, response });
    } catch (error) {
      console.error("Error al obtener datos de tabla:", error);
    } finally {
      tableConfig.isLoading = false;
    }
  };

  return { tableConfig, fetchTableData };
}