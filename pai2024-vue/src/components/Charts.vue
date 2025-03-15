<script>
import common from '../mixins/common'

const projectEndpoint = '/api/project'
const taskEndpoint = '/api/task'

import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GanttChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
use([ CanvasRenderer, GanttChart, GridComponent, TooltipComponent, TitleComponent ])

export default {
  props: [ 'session' ],
  emits: [ 'display-message' ],
  mixins: [ common ],
  components: { VChart },
  data() {
    return {
      projects: [],
      selectedProject: null,
      tasks: [],
      interval: null,
      ganttProjectsOptions: {
        title: { text: 'Projects Timeline' },
        tooltip: {
          formatter: params => {
            return `${params.value[2]}: ${this.formatDate(params.value[0])} - ${this.formatDate(params.value[1])}`
          }
        },
        xAxis: { type: 'time' },
        yAxis: { type: 'category' },
        series: [{
          type: 'gantt',
          data: [],
          encode: { xStart: 0, xEnd: 1, y: 2 },
          itemStyle: {
            color: params => params.data.itemStyle.color
          }
        }]
      },
      ganttTasksOptions: {
        title: { text: 'Tasks Timeline' },
        tooltip: {
          formatter: params => {
            return `${params.value[3]}: ${this.formatDate(params.value[0])} - ${this.formatDate(params.value[1])}`
          }
        },
        xAxis: { type: 'time' },
        yAxis: { type: 'category' },
        series: [{
          type: 'gantt',
          data: [],
          encode: { xStart: 0, xEnd: 1, y: 3 },
          itemStyle: {
            color: params => params.data.itemStyle.color
          }
        }]
      }
    }
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
    fetchProjects() {
      fetch(projectEndpoint)
          .then(res => res.json())
          .then(data => {
            this.projects = data.data
            this.updateProjectsGantt()
          })
    },
    updateProjectsGantt() {
      const now = new Date().toISOString().split('T')[0]
      this.ganttProjectsOptions.series[0].data = this.projects.map(p => {
        const endDate = p.endDate && new Date(p.endDate) < new Date() ? p.endDate : now
        return {
          value: [p.startDate, endDate, p.name],
          itemStyle: {
            color: p.endDate && new Date(p.endDate) < new Date() ? '#2ecc71' : '#e67e22'
          }
        }
      })
      this.ganttProjectsOptions = {...this.ganttProjectsOptions}
    },
    fetchTasks(projectId) {
      fetch(`${taskEndpoint}?project=${projectId}`)
          .then(res => res.json())
          .then(data => {
            this.tasks = data.data
            this.updateTasksGantt()
          })
    },
    updateTasksGantt() {
      const now = new Date().toISOString().split('T')[0]
      this.ganttTasksOptions.series[0].data = this.tasks.map(t => {
        const endDate = t.endDate && new Date(t.endDate) < new Date() ? t.endDate : now
        return {
          value: [t.startDate, endDate, t._id, t.name],
          itemStyle: {
            color: t.endDate && new Date(t.endDate) < new Date() ? '#2ecc71' : '#e67e22'
          }
        }
      })
      this.ganttTasksOptions = {...this.ganttTasksOptions}
    }
  },
  mounted() {
    this.fetchProjects()
    this.interval = setInterval(() => {
      this.fetchProjects()
      if (this.selectedProject) this.fetchTasks(this.selectedProject)
    }, 5000)
  },
  beforeUnmount() {
    clearInterval(this.interval)
  }
}
</script>

<template>
  <div>
    <h1>Analysis</h1>
    <div class="gantt-container">
      <h2>Projects Timeline</h2>
      <v-chart :option="ganttProjectsOptions" class="gantt-chart" />

      <h2>Project Tasks</h2>
      <select v-model="selectedProject" @change="fetchTasks(selectedProject)">
        <option value="">Select a project</option>
        <option v-for="p in projects" :key="p._id" :value="p._id">
          {{ p.name }}
        </option>
      </select>
ё
      <v-chart
          v-if="selectedProject && tasks.length"
          :option="ganttTasksOptions"
          class="gantt-chart"
      />
    </div>
  </div>
</template>

<style>
.gantt-chart {
  height: 500px;
  margin: 20px 0;
}
.gantt-container {
  max-width: 1200px;
  margin: 0 auto;
}
select {
  margin: 20px 0;
  padding: 8px;
  font-size: 16px;
  width: 300px;
}
</style>