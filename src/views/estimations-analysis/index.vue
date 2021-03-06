<template lang="pug">
  div()
    div(class="timebot-header") Estimations Analysis
    div(class="time-entries-filters-container")
      div(class="time-entries-filters")
        div(class="filters-label") Projects name
          el-select(
          v-model="searchParams.projects"
          filterable
          remote,
          clearable,
          @focus="remoteGetProjects"
          placeholder="Please select a project"
          @input="setParams"
          icon="arrow-up"
          :remote-method="remoteGetProjects"
          )
            el-option(v-for="project in filterable('projects')"
            :value="project.id"
            :key="project.id",
            :label="project.name")
      div(class="time-entries-filters")
        div(class="filters-label") Date
          el-date-picker(
            v-model="date",
            type="daterange",
            range-separator="-",
            value-format="yyyy-MM-dd",
            :picker-options="pickerOptions",
            @change="setParams"
            start-placeholder="Start date",
            end-placeholder="End date",
            placeholder="Please pick a date",
            prefix-icon="date-calendar")
      div(style="margin-right: 10px;")
        div(class="filters-label-csv")
          download-excel(:data="jsonData" :fields="json_fields" type="csv" name="estimations.xls")
            el-button(:disabled="!jsonData.length") Download CSV
      div(style="margin: 19px 0px 0px;" class="time-entries-filters")
        el-button.el-button-filter(@click="clearFilter") Clear
    el-table(:data="list('estimationReports')")
      el-table-column(
      prop="project",
      label="Project",
      width="110")
        template(slot-scope="scope")
          span(v-for="project in scope.row.projects" :key="project.id") {{ project.name }}&nbsp;
      el-table-column(
      prop="details",
      label="Details")
      el-table-column(
      label="Collaborators")
        template(slot-scope="scope")
          span(v-for="(collaborator, collaboratorIndex) in scope.row.collaborators" :key="collaborator.id") {{ collaborator.name }}
            span(v-if="scope.row.collaborators.length > collaboratorIndex + 1") ,&nbsp;
      el-table-column(
      prop="created_at",
      label="Created at",
      width="130")
      el-table-column(
      prop="trello_labels",
      label="Trello labels",
      width="150")
      el-table-column(
      prop="estimate",
      label="Estimate",
      width="90")
      el-table-column(
      prop="total_time",
      label="Time spent",
      width="110")
      el-table-column(
      prop="status",
      label="Status",
      width="100")
    pagination(:store="store" :type="type" v-if="list(type).length")
</template>

<script>
import * as mixin from '@/mixins/index'
import { mapGetters } from 'vuex'
import pagination from '@/components/Pagination/index'
import { fetchList } from '@/api/actionEntityTable'
import { setQuery } from '@/api/queryConst'
export default {
  name: 'Estimations',
  components: {
    pagination
  },
  mixins: [mixin.mixQuery, mixin.mixIncludes, mixin.mixDate],
  data: () => ({
    type: 'estimationReports',
    store: 'reportsTable',
    searchParams: {
      projects: ''
    },
    json_fields: {
      'Project': 'projects',
      'Details': 'details',
      'Collaborators': 'collaborators',
      'Created at': 'created_at',
      'Trello labels': 'trello_labels',
      'Estimate': 'estimate',
      'Total time': 'total_time',
      'Status': 'status'
    },
    jsonData: []
  }),
  computed: {
    ...mapGetters({
      list: 'reportsTable/list',
      filterable: 'actionEntityTable/filterable',
      loader: 'reportsTable/loader',
      pagination: 'pagination'
    }),
    date_period() {
      return {
        date_from: this.date ? this.date[0] : '',
        date_to: this.date ? this.date[1] : ''
      }
    }
  },
  mounted() {
    this.setParams()
  },
  methods: {
    clearFilter() {
      this.searchParams.projects = ''
      this.date = [new Date(), new Date()]
      this.$store.dispatch('reportsTable/setFilter', { by_projects: this.searchParams.projects, date_from: this.date_period.date_from, date_to: this.date_period.date_to })
      this.getList()
    },
    getList() {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('setLoader', true)
        this.$store.dispatch('reportsTable/fetchList', this.type)
          .then(() => {
            this.$store.dispatch('setLoader', false)
            resolve()
          })
      })
    },
    setParams(date) {
      this.jsonData = []
      this.$store.dispatch('setLoader', true)
      this.$store.dispatch('setPagination', { page: 1 }, { root: true })
      this.$store.dispatch('reportsTable/setFilter', { by_projects: [this.searchParams.projects], date_from: this.date_period.date_from, date_to: this.date_period.date_to })
        .then(() => {
          this.getList()
            .then(() => {
              this.$store.dispatch('setLoader', false)
              this.getJsonStructure()
            })
        })
    },
    getJsonStructure() {
      let jsonData = []
      if (this.date === null) {
        this.date = [new Date(), new Date()]
      }
      fetchList(setQuery(this.type), { by_projects: [this.searchParams.projects], date_from: this.date_period.date_from, date_to: this.date_period.date_to, page: 1, per_page: this.pagination.total })
        .then((response) => {
          jsonData = response.data.data
          jsonData.forEach(jd => {
            let collaborators = ''
            jd.collaborators.forEach(cl => {
              collaborators += cl.name + ', '
            })
            jd.details = jd.details.replace(/;/g, ',')
            jd.details = jd.details.replace(/	/g, ' ') // horizontal tab to space
            jd.collaborators = collaborators
            jd.projects = jd.projects[0].name
          })
          this.jsonData = jsonData
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
