<template>
  <div class="project-selector">
    <h2>Select Project for Task Analysis</h2>
    <projects-analysis :projects="sortedProjects" />
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
      <project-analysis :currentProject="currentProject" />
    </div>
  </div>
</template>

<script>
import ProjectAnalysis from "@/components/ProjectAnalysis.vue";
import ProjectsAnalysis from "@/components/ProjectsAnalysis.vue";

export default {
  components: {
    ProjectAnalysis,
    ProjectsAnalysis,
  },
  data() {
    return {
      projects: [],
      currentProject: null,
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
  },
  mounted() {
    this.fetchProjects();
  },
};
</script>

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
