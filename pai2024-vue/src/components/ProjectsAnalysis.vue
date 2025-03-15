<template>
  <g-gantt-chart
      :chart-start="start"
      :chart-end="end"
      precision="day"
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
</script>
