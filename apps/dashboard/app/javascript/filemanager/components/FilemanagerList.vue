<template>
  <div
    v-on:keydown="onKeyDown"
    v-on:keyup="onKeyUp"
  >
    <v-client-table
      ref='dataTable'
      :data="fs_entries()"
      :columns="columns"
      :options="options"
      name="table"

      v-on:row-click="onRowClick"
      v-on:filter="onFilter"
      v-on:sorted="onSort"
    >
      <span slot="basename" slot-scope="{row}"><i :class="file_icon(row.mime_type)"></i> <a :href="file_link(row.path)">{{ row.basename }}</a></span>
      <span slot="size" slot-scope="{row}">{{ file_size(row.size, {round: 0}) }}</span>
      <span slot="modified" slot-scope="{row}">{{ moment_unix(row.modified).format() }}</span>
      <div slot="beforeTable" class="form-group">
        <input type="checkbox" v-on:click="updateTable">
        <label for="checkbox">Show dot files</label>
      </div>
    </v-client-table>
    <modals-container/>
  </div>
</template>

<script>
import {file_icon, file_link} from '../helper'
import filesize from 'filesize'
import moment from 'moment'
import * as Path from 'path'

// polyfill for MAX_SAFE_INTEGER
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = 9007199254740991; // Math.pow(2, 53) - 1;
}

// available in underscore/lodash
function clamp(min, max, num) {
  return Math.max(min, Math.min(num, max))
}

export default {
  name: 'FilemanagerList',
  props: ['store'],
  data () {
    return {
      columns: ['basename', 'size', 'modified', 'owner', 'group', 'permissions'],
      dataTable: null,
      options: {
        // filterable: ['basename', 'size', 'modified', 'owner', 'group', 'permissions'],
        columnsClasses: {
          modified:    'hidden-xs hidden-sm',
          owner:       'hidden-xs hidden-sm',
          group:       'hidden-xs hidden-sm',
          permissions: 'hidden-xs hidden-sm hidden-md',
        },
        perPage: Number.MAX_SAFE_INTEGER,
        perPageValues: []
      },
      cursor: null,
      showDotFiles: false,
      keydown: {
        'Shift': false,
        'Meta': false,
        'Control': false
      }
    }
  },
  methods: {
    file_icon: file_icon,
    file_link: file_link,
    file_size: filesize,
    moment_unix: moment.unix,
    onRowClick: function(payload) {
      const index = payload.index
      if(this.multiselect) {
        this.$store.commit('toggleSelection', payload)
      } else {
        this.$store.commit('clearSelection')
        this.$store.commit('toggleSelection', payload)
      }

      this.cursor = (this.cursor === index) ? null : index
      this.onSelectionUpdate()
    },
    onSelectionUpdate: function() {
      self = this
      const selection = this.$store.state.selection
      // .allFilteredData is in presentation order
      const tableData = this.$refs.dataTable.allFilteredData
      console.log(['First', tableData[0].basename, selection])
      console.log(['Last', tableData[tableData.length - 1].basename, selection])
      this.childRows().forEach((rowElement, index) => {
        if(self.rowIsSelected(tableData[index], selection)) {
          rowElement.style = 'background-color: #e7e7e7'
        } else {
          rowElement.style = ''
        }
      })
    },
    rowIsSelected: function(rowData, selection) {      
      return selection.hasOwnProperty(rowData.basename)
    },
    onKeyDown: function(event) {
      const key = event.key
      switch(key) {
      case 'ArrowDown':
        this.shiftSelection(1)
        event.preventDefault()
        break
      case 'ArrowUp':
        this.shiftSelection(-1)
        event.preventDefault()
        break
      case 'Shift':
      case 'Control':
      case 'Meta':
        this.keydown[key] = true
        break
      // default:
      //   console.log(event.key)
      }

      this.onSelectionUpdate()
    },
    onKeyUp: function(event) {
      const key = event.key
      switch(key) {
      case 'Shift':
      case 'Control':
      case 'Meta':
        this.keydown[key] = false
        break
      }
    },
    shiftSelection: function(step) {
      if(this.cursor) {
        this.cursor = clamp(
          1,
          this.cursor + step,
          this.childRows().length
        )
      }
    },
    onSort: function(payload) {
      this.onSelectionUpdate()
    },
    onFilter: function(payload) {
      this.cursor = null
      this.onSelectionUpdate()
    },
    updateTable: function() {
      this.showDotFiles = ! this.showDotFiles
      this.$store.commit('toggleShowDotfiles')
      this.$store.commit('updateTable', this.fs_entries())
    },
    childRows() {
      return this.$refs.dataTable.$el.querySelectorAll('tr.VueTables__row')
    },
    fs_entries() {
      return this.$store.state.file_system_entries.filter((entry) => {
        if(! this.showDotFiles && entry.basename[0] === '.') {
          return false
        }

        return true
      })
    },
  },
  mounted () {
    this.dataTable = this.$refs.dataTable
    this.$store.commit('setTable', this.dataTable)
    // window.addEventListener('keydown', this.onKeyDown)
    // window.addEventListener('keyup', this.onKeyUp)
  },
  computed: {
    multiselect() {
      return Object.values(this.keydown).some((value) => {return value})
    }
  }
}
</script>

<style lang="css">
</style>