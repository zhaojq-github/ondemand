<template>
  <div>
    <v-client-table
      ref='dataTable'
      :data="store.file_system_entries"
      :columns="columns"
      :options="options"
      
      v-on:row-click="onRowClick"
      v-on:filter="cursor = null"
    >
      <a slot="basename" slot-scope="{row}" :href="file_link(row.path)">{{ row.basename }}</a>
      <span slot="size" slot-scope="{row}">{{ file_size(row.size, {round: 0}) }}</span>
      <span slot="modified" slot-scope="{row}">{{ moment_unix(row.modified).format() }}</span>
    </v-client-table>
    <modals-container/>
  </div>
</template>

<script>
import {file_link} from '../helper'
import filesize from 'filesize'
import moment from 'moment'
// import UploadModal from './UploadModal'
import * as Path from 'path'

// polyfill for MAX_SAFE_INTEGER
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = 9007199254740991; // Math.pow(2, 53) - 1;
}

window.Selection = {
  cursor: null,
  _selection: {},
  updateCursor: function(value) {
    this.cursor = value
  }
}

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
        // childRow: 'table-buttons',
        columnsClasses: {
          modified:    'hidden-xs hidden-sm',
          owner:       'hidden-xs hidden-sm',
          group:       'hidden-xs hidden-sm',
          permissions: 'hidden-xs hidden-sm hidden-md',
        },
        perPage: Number.MAX_SAFE_INTEGER,
        perPageValues: [],
      },
      cursor: null,
      childRows: null
    }
  },
  methods: {
    file_link: file_link,
    file_size: filesize,
    moment_unix: moment.unix,
    onRowClick: function(payload) {
      const index = payload.index
      this.cursor = (this.cursor === index) ? null : index
      this.onSelectionUpdate()
    },
    onSelectionUpdate: function() {
      self = this
      this.childRows.forEach((row, index) => {
        if(self.cursor === index + 1) {
          row.style = 'background: red'
        } else {
          row.style = ''
        }
      })
    },
    // rowIsSelected: function(row) {
    //   const path = row.children[0].children[0].innerHTML
    //   return this.cursor &&
    //   (
    //     (path === Path.basename(this.cursor)) ||
    //     (this.cursor === '/' && Path.basename(path) === '')
    //   )
    // },
    onKeyDown: function(event) {
      switch(event.key) {
      case 'ArrowDown':
        this.shiftSelection(1)
        event.preventDefault()
        break
      case 'ArrowUp':
        this.shiftSelection(-1)
        event.preventDefault()
        break
      // default:
      //   console.log(event.key)
      }

      this.onSelectionUpdate()
    },
    shiftSelection: function(step) {
      console.log(`Before: ${this.cursor} + ${step}`)
      if(this.cursor) {
        this.cursor = clamp(
          1,
          this.cursor + step,
          this.childRows.length
        )
      }
      console.log(`After: ${this.cursor}`)
    },
    updateChildRows: function() {
      this.childRows = this.dataTable.$el.querySelectorAll('tr.VueTables__row')
    }
  },
  mounted () {
    this.dataTable = this.$refs.dataTable
    this.updateChildRows()
    window.addEventListener('keydown', this.onKeyDown)
  }
}
</script>

<style lang="css">
.VueTables__child-row-toggler {
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: block;
    margin: auto;
    text-align: center;
}

.VueTables__child-row-toggler--closed::before {
    content: "+";
}

.VueTables__child-row-toggler--open::before {
    content: "-";
}
</style>