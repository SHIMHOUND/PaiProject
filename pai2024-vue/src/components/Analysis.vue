<script>
import common from '../mixins/common'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent])

export default {
  props: ['session'],
  emits: ['display-message'],
  mixins: [common],
  components: { VChart },
  data() {
    return {
      projects: [],
      tasks: [],
      selectedProject: null,
      projectGanttOptions: {
        title: {
          text: 'Projects Gantt Chart'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const project = params[0].data.project;
            return `<strong>${project.name}</strong><br/>
                    Start: ${new Date(project.start_date).toLocaleDateString()}<br/>
                    End: ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}<br/>
                    Status: ${project.finished ? 'Finished' : 'In Progress'}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: '{dd}/{MM}/{yyyy}'
          }
        },
        yAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            formatter: function(value) {
              return value.length > 15 ? value.substring(0, 15) + '...' : value;
            }
          }
        },
        series: [
          {
            type: 'bar',
            name: 'Projects',
            itemStyle: {
              color: function(params) {
                return params.data.project.finished ? '#67C23A' : '#E6A23C';
              }
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: []
          }
        ]
      },
      taskGanttOptions: {
        title: {
          text: 'Tasks for Selected Project'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const task = params[0].data.task;
            return `<strong>${task.name}</strong><br/>
                    Start: ${new Date(task.start_date).toLocaleDateString()}<br/>
                    End: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Ongoing'}<br/>
                    Status: ${task.finished ? 'Finished' : 'In Progress'}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: '{dd}/{MM}/{yyyy}'
          }
        },
        yAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            formatter: function(value) {
              return value.length > 15 ? value.substring(0, 15) + '...' : value;
            }
          }
        },
        series: [
          {
            type: 'bar',
            name: 'Tasks',
            itemStyle: {
              color: function(params) {
                return params.data.task.finished ? '#67C23A' : '#E6A23C';
              }
            },
            encode: {
              x: [1, 2],
              y: 0
            },
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.fetchProjects();

    // Set up WebSocket or polling for real-time updates
    this.setupRealTimeUpdates();
  },
  methods: {
    fetchProjects() {
      fetch('/api/project?sort=start_date&order=1')
          .then(res => res.json())
          .then(response => {
            this.projects = response.data;
            this.updateProjectGantt();
          })
          .catch(err => {
            this.$emit('display-message', {
              type: 'error',
              text: 'Failed to load projects: ' + err.message
            });
          });
    },
    fetchTasksForProject(projectId) {
      if (!projectId) {
        this.tasks = [];
        this.updateTaskGantt();
        return;
      }

      fetch(`/api/task?project_id=${projectId}&sort=start_date&order=1`)
          .then(res => res.json())
          .then(response => {
            this.tasks = response.data;
            this.updateTaskGantt();
          })
          .catch(err => {
            this.$emit('display-message', {
              type: 'error',
              text: 'Failed to load tasks: ' + err.message
            });
          });
    },
    updateProjectGantt() {
      const today = new Date();
      const ganttData = this.projects.map((project, index) => {
        const startDate = new Date(project.start_date);
        let endDate = project.end_date ? new Date(project.end_date) : today;

        // For unfinished projects without end_date, use today's date
        if (!project.finished && !project.end_date) {
          endDate = today;
        }

        return {
          value: [project.name, startDate, endDate],
          project: project
        };
      });

      this.projectGanttOptions.yAxis.data = this.projects.map(p => p.name);
      this.projectGanttOptions.series[0].data = ganttData;
    },
    updateTaskGantt() {
      const today = new Date();
      const ganttData = this.tasks.map((task, index) => {
        const startDate = new Date(task.start_date);
        let endDate = task.end_date ? new Date(task.end_date) : today;

        // For unfinished tasks without end_date, use today's date
        if (!task.finished && !task.end_date) {
          endDate = today;
        }

        return {
          value: [task.name, startDate, endDate],
          task: task
        };
      });

      this.taskGanttOptions.yAxis.data = this.tasks.map(t => t.name);
      this.taskGanttOptions.series[0].data = ganttData;
    },
    onProjectSelect(event) {
      const projectId = event.target.value;
      this.selectedProject = this.projects.find(p => p.id === projectId) || null;
      this.fetchTasksForProject(projectId);
    },
    setupRealTimeUpdates() {
      // Option 1: WebSocket if your app supports it
      /*
      const ws = new WebSocket('ws://your-websocket-endpoint');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'project_update') {
          this.fetchProjects();
        } else if (data.type === 'task_update' && this.selectedProject && data.projectId === this.selectedProject.id) {
          this.fetchTasksForProject(this.selectedProject.id);
        }
      };
      */

      // Option 2: Polling approach
      setInterval(() => {
        this.fetchProjects();
        if (this.selectedProject) {
          this.fetchTasksForProject(this.selectedProject.id);
        }
      }, 10000); // Poll every 10 seconds
    }
  }
}
</script>

<template>
  <div class="analysis-container">
    <h1>Analysis</h1>

    <div class="gantt-section">
      <h2>Project Timeline</h2>
      <v-chart :option="projectGanttOptions" class="gantt-chart"></v-chart>
    </div>

    <div class="project-selector">
      <h2>Select Project for Task Analysis</h2>
      <select @change="onProjectSelect" class="project-select">
        <option value="">-- Select a Project --</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedProject" class="gantt-section">
      <h2>Tasks for: {{ selectedProject.name }}</h2>
      <v-chart :option="taskGanttOptions" class="gantt-chart"></v-chart>
    </div>
  </div>
</template>

<style>
.analysis-container {
  padding: 20px;
}

.gantt-chart {
  height: 400px;
  width: 100%;
  margin-bottom: 30px;
}

.project-selector {
  margin: 20px 0;
}

.project-select {
  padding: 8px;
  width: 300px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.gantt-section {
  margin-bottom: 40px;
}
</style>