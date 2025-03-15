<template>
  <g-gantt-chart
      :chart-start="currentProjectStart"
      :chart-end="currentProjectEnd"
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
  currentProject: {
    type: Object,
    required: true,
    default: () => ({
      startDate: '',
      endDate: '',
      tasks: []
    })
  }
});

const currentTasks = computed(() => {
  if (!props.currentProject || !props.currentProject.tasks) return [];
  return props.currentProject.tasks.map(task => {
    const start = dayjs(task.startDate);
    const end = task.endDate ? dayjs(task.endDate) : start.add(1, 'day');

    return {
      beginDate: useDateFormat(start, 'YYYY-MM-DD HH:mm').value,
      endDate: useDateFormat(end, 'YYYY-MM-DD HH:mm').value,
      ganttBarConfig: {
        id: task._id,
        label: task.name
      }
    };
  });
});

const currentProjectStart = computed(() =>
    props.currentProject.startDate ? useDateFormat(props.currentProject.startDate, 'YYYY-MM-DD HH:mm').value : null
);

const currentProjectEnd = computed(() =>
    props.currentProject.endDate ? useDateFormat(props.currentProject.endDate, 'YYYY-MM-DD HH:mm').value : null
);
</script>
