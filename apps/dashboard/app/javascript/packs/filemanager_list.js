import Vue from 'vue'
import {ServerTable, ClientTable, Event} from 'vue-tables-2'
import VModal from 'vue-js-modal'

Vue.use(ClientTable, {}, true, 'bootstrap3', 'default')
Vue.use(VModal, { dynamic: true })

import FilemanagerList from '../filemanager/components/FilemanagerList'
import store from '../filemanager/store'

document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    el: '#filemanager-list',
    store,
    render: h => h(FilemanagerList)
  })
})
