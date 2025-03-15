<template>
  <div v-if="user && checkIfInRole(user, [0])" class="analysis-container">
    <div class="project-selector">
      <h2>Select Project for Task Analysis</h2>
      <projects-analysis :projects="sortedProjects"/>
      <div class="project-selector">
        <h2>Select Project for Task Analysis</h2>
        <select @change="onProjectSelect" class="project-select">
          <option value="">-- Select a Project --</option>
          <option v-for="project in sortedProjects" :key="project._id" :value="project._id">
            {{ project.name }}
          </option>
        </select>
      </div>
      <div v-if="currentProject" class="gantt-section">
        <h2>Tasks for: {{ currentProject.name }}</h2>
        <project-analysis :current-project="currentProject" />
      </div>
    </div>
  </div>
  <div v-else class="access-denied">
    <h2>Access denied. Admin rights required.</h2>
  </div>
</template>

<script>
import ProjectAnalysis from "@/components/ProjectAnalysis.vue";
import ProjectsAnalysis from "@/components/ProjectsAnalysis.vue";
import common from "@/mixins/common";

export default {
  mixins: [common],
  components: {
    ProjectAnalysis,
    ProjectsAnalysis,
  },
  props: ['user'],
  data() {
    return {
      projects: [],
      currentProject: null,
      refreshInterval: null
    };
  },
  computed: {
    sortedProjects() {
      return this.projects.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
  },
  methods: {
    async fetchProjects() {
      const response = await fetch("/api/project?sort=start_date&order=1");
      const data = await response.json();
      this.projects = data.data;
    },
    onProjectSelect(event) {
      const projectId = event.target.value;
      this.currentProject = this.projects.find((p) => p._id === projectId) || null;
    },
    setupAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.fetchProjects();
      }, 5000); // Обновление каждые 5 секунд
    }
  },
  mounted() {
    this.fetchProjects();
    this.setupAutoRefresh();
  },
  beforeUnmount() {
    clearInterval(this.refreshInterval);
  }
};
</script>

<style>
/* Существующие стили остаются без изменений */
.access-denied {
  padding: 20px;
  color: #ff4444;
}
</style>