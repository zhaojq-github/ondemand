import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    showDotfiles: false,
    table_ref: null,
    selection: {},
    file_system_entries: window.STORE.file_system_entries // TODO rename this
  },
  mutations: {
    toggleShowDotfiles (state) {
      state.showDotfiles = ! state.showDotfiles
    },
    setTable (state, payload) {
      state.table_ref = payload.table_ref
    },
    updateTable (state, payload) {
        state.table.data = payload
        state.table.count = state.table.data.length
    },
    clearSelection (state) {
        state.selection = {}
    },
    toggleSelection (state, payload) {
        const row = payload.row
        const basename = row.basename
        if(state.selection.hasOwnProperty(basename)) {
          delete state.selection[basename]
        } else {
          state.selection[basename] = row  
        }
    },
    removeFromSelection (state, payload) {
        delete state.selection[payload.row.basename]
    }
  },
  computed: {
    
  }
})