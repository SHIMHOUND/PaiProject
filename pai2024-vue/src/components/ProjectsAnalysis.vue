<template>
  <g-gantt-chart
      :chart-start="start"
      :chart-end="end"
      precision="month"
      bar-start="beginDate"
      bar-end="endDate"
      row-height="60"
  >
    <g-gantt-row v-for="task in currentTasks" :key="task.ganttBarConfig.id" :label="task.ganttBarConfig.label" :bars="[task]" />
  </g-gantt-chart>
</template>

<script setup>
import { computed } from "vue";
import { useDateFormat } from "@vueuse/core";
import dayjs from "dayjs";

const props = defineProps({
  projects: {
    type: Object,
    required: true,
    default: () => ([])
  }
});


const firstProject = computed(() => props.projects[0])
const lastProject = computed(() => props.projects[props.projects.length - 1])

const currentTasks = computed(() => {
  return props.projects.map(project => {
    const start = dayjs(project.startDate);
    const end = project.endDate ? dayjs(project.endDate) : start.add(1, 'day');

    return {
      beginDate: useDateFormat(start, 'YYYY-MM-DD HH:mm').value,
      endDate: useDateFormat(end, 'YYYY-MM-DD HH:mm').value,
      ganttBarConfig: {
        id: project._id,
        label: project.name
      }
    };
  });
});

const start = computed(() =>
    firstProject?.value?.startDate ? useDateFormat(firstProject.value.startDate, 'YYYY-MM-DD HH:mm').value : null
);

const end = computed(() =>
    lastProject?.value?.endDate ? useDateFormat(lastProject.value.endDate, 'YYYY-MM-DD HH:mm').value : null
);
// const precision = computed(() => {
//   if (!props.projects || props.projects.length === 0) return 'month'; // Значение по умолчанию
//
//   // Находим максимальную длительность проекта
//   const maxDuration = Math.max(
//       ...props.projects.map(project => {
//         const start = dayjs(project.startDate);
//         const end = project.endDate ? dayjs(project.endDate) : start.add(1, 'day');
//         return end.diff(start, 'day'); // Длительность в днях
//       })
//   );
//
//   // Определяем precision на основе длительности
//   if (maxDuration <= 1) {
//     return 'day'; // Если проект длится меньше или равно 1 дню
//   } else if (maxDuration <= 365) {
//     return 'month'; // Если проект длится меньше или равно 1 году
//   } else {
//     return 'year'; // Если проект длится больше 1 года
//   }
// });
</script>
