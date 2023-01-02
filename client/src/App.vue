<template>
  <div class="boxed-layout horizontal">
    <AppHeader></AppHeader>

    <div class="layout-px-spacing dash_1">
      <div class="row layout-top-spacing">
        <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                    <div class="widget widget-sales-category">
                        <div class="widget-heading">
                            <h5>Create your query</h5>
                            <button @click="fetchQuery" type="button" class="btn btn-warning btn-sm mb-4 me-2">Run</button>
                        </div>
                        <div class="widget-content">                           

                            <div class="row mb-12" v-for="index in inputsAmount" :key="index">
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'protocol'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <div class="form-control" v-for="values, i in inputValues[index - 1]" :key="i">
                                      <multiselect v-if="i == 0" v-model="inputValues[index - 1][i]" :options="options.protocol" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                      <multiselect v-if="i == 1" v-model="inputValues[index - 1][i]" :options="options.what" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>                                    
                                    </div>
                                    <span class="input-group-text" id="basic-addon1" @click="removeInput(index - 1)">X</span>
                                </div>
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'chain'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <div class="form-control" v-for="values, i in inputValues[index - 1]" :key="i">
                                      <multiselect v-if="i == 0" v-model="inputValues[index - 1][0]" :options="options.chain.x" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                      <multiselect v-if="i == 1" v-model="inputValues[index - 1][1]" :options="inputValues[index - 1][0] == '' ? '' : options.chain.dimension[inputValues[index - 1][0]]" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>                                    
                                    </div>
                                    <span style="cursor:pointer;" class="input-group-text" id="basic-addon1" @click="removeInput(index - 1)">X</span>
                                </div>
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'filter'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <span v-for="condition, i in inputValues[index - 1]" class="form-control" :key="i">                                  
                                      <multiselect v-if="i == 0" v-model="inputValues[index - 1][0]" :options="['Date']" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                      <multiselect v-if="i == 1" v-model="inputValues[index - 1][1]" :options="['>', '<']" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                      <flat-pickr style="cursor:pointer;padding-top:10px; padding-bottom:10px; background: #1b2e4b;border-color: #3b3f5c;" v-if="i == 2" v-model="inputValues[index - 1][2]" class="form-control flatpickr active"></flat-pickr>
                                    </span>    
                                    <span style="cursor:pointer;" class="input-group-text" id="basic-addon1" @click="removeInput(index - 1)">X</span>                          
                                </div>
                            </div>
                            <div v-html="printOutputs"></div>                      

                            <br>
                            <div class="row mb-12">
                              <div class="col-sm-12">
                                  <span class="btn btn-info me-1" @click="addInput('chain')">+ Chain</span>
                                  <span class="btn btn-info me-1" @click="addInput('protocol')">+ Protocol</span>
                                  <span class="btn btn-info me-1" @click="addInput('filter')">+ Filter</span>
                              </div>                              
                            </div>                            
                        </div>
                    </div>
                </div>

        <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
          <div class="widget widget-revenue">
              <div class="widget-heading">
                  <h5>Results</h5>
                  
                  <div class="dropdown btn-group">
                      <a v-if="table" class="btn dropdown-toggle btn-icon-only" style="margin-right:15px;" @click="toggleTable()"> 
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:#0E1726; color:#fff"
                        version="1.1" width="24" height="24" viewBox="0 0 256 256" xml:space="preserve" fill="none"
                              stroke="white">
                        <defs>
                        </defs>
                        <g style="stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
                          <path d="M 87.994 0 H 69.342 c -1.787 0 -2.682 2.16 -1.418 3.424 l 5.795 5.795 l -33.82 33.82 L 28.056 31.196 l -3.174 -3.174 c -1.074 -1.074 -2.815 -1.074 -3.889 0 L 0.805 48.209 c -1.074 1.074 -1.074 2.815 0 3.889 l 3.174 3.174 c 1.074 1.074 2.815 1.074 3.889 0 l 15.069 -15.069 l 14.994 14.994 c 1.074 1.074 2.815 1.074 3.889 0 l 1.614 -1.614 c 0.083 -0.066 0.17 -0.125 0.247 -0.202 l 37.1 -37.1 l 5.795 5.795 C 87.84 23.34 90 22.445 90 20.658 V 2.006 C 90 0.898 89.102 0 87.994 0 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #888ea8; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                          <path d="M 65.626 37.8 v 49.45 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 23.518 L 65.626 37.8 z" style="stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill:#888ea8; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                          <path d="M 47.115 56.312 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 42.03 L 47.115 56.312 z" style="stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #888ea8; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                          <path d="M 39.876 60.503 c -1.937 0 -3.757 -0.754 -5.127 -2.124 l -6.146 -6.145 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 59.844 C 41.952 60.271 40.933 60.503 39.876 60.503 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #888ea8; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                          <path d="M 22.937 46.567 L 11.051 58.453 c -0.298 0.298 -0.621 0.562 -0.959 0.8 V 87.25 c 0 1.519 1.231 2.75 2.75 2.75 h 8.782 c 1.519 0 2.75 -1.231 2.75 -2.75 V 48.004 L 22.937 46.567 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #888ea8; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
                        </g>
                        </svg>
                      </a>
                      <a v-if="!table" class="btn dropdown-toggle btn-icon-only" style="margin-right:15px;" @click="toggleTable()"> 
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 102.52" style="enable-background:new 0 0 122.88 102.52" xml:space="preserve" fill="#888ea8">
                          <g>
                            <path class="st0" d="M5.42,0h112.04c2.98,0,5.42,2.44,5.42,5.42V97.1c0,2.98-2.44,5.42-5.42,5.42H5.42c-2.98,0-5.42-2.44-5.42-5.42 V5.42C0,2.44,2.44,0,5.42,0L5.42,0z M8.48,23.58H38.1c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48H8.48 c-0.81,0-1.48-0.67-1.48-1.48v-9.76C6.99,24.25,7.66,23.58,8.48,23.58L8.48,23.58z M84.78,82.35h29.63c0.82,0,1.48,0.67,1.48,1.48 v9.76c0,0.81-0.67,1.48-1.48,1.48H84.78c-0.81,0-1.48-0.67-1.48-1.48v-9.76C83.29,83.02,83.96,82.35,84.78,82.35L84.78,82.35z M46.8,82.35h29.28c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48H46.8c-0.81,0-1.48-0.67-1.48-1.48v-9.76 C45.31,83.02,45.98,82.35,46.8,82.35L46.8,82.35z M8.48,82.35H38.1c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48 H8.48c-0.81,0-1.48-0.67-1.48-1.48v-9.76C6.99,83.02,7.66,82.35,8.48,82.35L8.48,82.35z M84.78,62.76h29.63 c0.82,0,1.48,0.67,1.48,1.48V74c0,0.81-0.67,1.48-1.48,1.48H84.78c-0.81,0-1.48-0.67-1.48-1.48v-9.76 C83.29,63.43,83.96,62.76,84.78,62.76L84.78,62.76z M46.8,62.76h29.28c0.82,0,1.48,0.67,1.48,1.48V74c0,0.81-0.67,1.48-1.48,1.48 H46.8c-0.81,0-1.48-0.67-1.48-1.48v-9.76C45.31,63.43,45.98,62.76,46.8,62.76L46.8,62.76z M8.48,62.76H38.1 c0.82,0,1.48,0.67,1.48,1.48V74c0,0.81-0.67,1.48-1.48,1.48H8.48c-0.81,0-1.48-0.67-1.48-1.48v-9.76 C6.99,63.43,7.66,62.76,8.48,62.76L8.48,62.76z M84.78,43.17h29.63c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48 H84.78c-0.81,0-1.48-0.67-1.48-1.48v-9.76C83.29,43.84,83.96,43.17,84.78,43.17L84.78,43.17z M46.8,43.17h29.28 c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48H46.8c-0.81,0-1.48-0.67-1.48-1.48v-9.76 C45.31,43.84,45.98,43.17,46.8,43.17L46.8,43.17z M8.48,43.17H38.1c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48 H8.48c-0.81,0-1.48-0.67-1.48-1.48v-9.76C6.99,43.84,7.66,43.17,8.48,43.17L8.48,43.17z M84.78,23.58h29.63 c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48H84.78c-0.81,0-1.48-0.67-1.48-1.48v-9.76 C83.29,24.25,83.96,23.58,84.78,23.58L84.78,23.58z M46.8,23.58h29.28c0.82,0,1.48,0.67,1.48,1.48v9.76c0,0.81-0.67,1.48-1.48,1.48 H46.8c-0.81,0-1.48-0.67-1.48-1.48v-9.76C45.31,24.25,45.98,23.58,46.8,23.58L46.8,23.58z"/>
                          </g>
                        </svg>
                      </a>
                      <a href="javascript:;" id="ddlRevenue" class="btn dropdown-toggle btn-icon-only" data-bs-toggle="dropdown" aria-expanded="false">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="feather feather-more-horizontal"
                          >
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                      </a>
                      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="ddlRevenue">
                          <li><a href="javascript:;" class="dropdown-item">Last 30 days</a></li>
                      </ul>
                  </div>
              </div>

              <div class="widget-content">
                  <!-- <div class="chart-title">Total Profit <span class="text-primary ms-1">$10,840</span></div> -->
                  <div v-if="!table">
                    <apex-chart v-if="revenue_options" height="325" :type="chartType" :options="revenue_options" :series="revenue_series"></apex-chart>
                  </div>

                  <div v-if="table && tableData.length > 0">
                    <div class="VueTables VueTables--client">
                      <div class="row">
                        <div class="col-md-12">                        
                          <div class="form-group form-inline pull-right VueTables__limit">
                            <div class="VueTables__limit-field">                            
                              <select id="VueTables__limit_0svA4" class="form-control">
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <table class="VueTables__table table" summary="false" v-for="x in tableData" :key="x">
                        <thead class="">
                          <tr>
                            <th class="VueTables__sortable " title="" tabindex="0" v-for="column in x.columns" :key="column">
                              <span class="VueTables__heading">{{ column }}</span>
                            </th>                          
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="VueTables__row" v-for="row in x.rows" :key="row">                          
                            <td tabindex="0" class="">
                              {{ row[0]}}
                            </td>
                            <td tabindex="0" class="">
                              {{ row[1]}}
                            </td>
                            <td tabindex="0" class="">
                              {{ row[2]}}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div class="VuePagination row col-md-12 ">
                        <nav class="text-center">
                          <ul class="VuePagination__pagination pagination VuePagination__pagination" style="">
                            <li class="VuePagination__pagination-item VuePagination__pagination-item page-item VuePagination__pagination-item VuePagination__pagination-item-prev-page page-item  disabled VuePagination__pagination-item-prev-page disabled">
                              <button type="button" class="page-link" disabled="">&lt;</button>
                            </li>
                            <li class="VuePagination__pagination-item VuePagination__pagination-item page-item active">
                              <button class="page-link active">1</button>
                            </li>
                            <li class="VuePagination__pagination-item VuePagination__pagination-item page-item ">
                              <button class="page-link ">2</button>
                            </li>
                            <li class="VuePagination__pagination-item VuePagination__pagination-item page-item ">
                              <button class="page-link ">3</button>
                            </li>
                            <li class="VuePagination__pagination-item VuePagination__pagination-item page-item VuePagination__pagination-item  VuePagination__pagination-item-next-page page-item   VuePagination__pagination-item-next-page ">
                              <button type="button" class="page-link">&gt;</button>
                            </li>
                          </ul>
                          <p class="VuePagination__count VuePagination__count text-center col-md-12" style="">Showing 1 to 10 of 27</p>
                        </nav>
                      </div>

                    </div>
                  </div>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
</template>

<script>
import '@/assets/sass/app.scss';
import '@/assets/sass/widgets/widgets.scss';
import ApexChart from 'vue3-apexcharts';
import Multiselect from '@suadelabs/vue3-multiselect';
import '@suadelabs/vue3-multiselect/dist/vue3-multiselect.css';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

import AppHeader from '@/components/header.vue';
import axios from 'axios'

export default {
  name: 'App',
  components: {
    AppHeader,
    Multiselect,
    ApexChart,
    flatPickr
  },
  data: function() {
    return {        
        table: false,
        tableData: [],
        chartType: "area",
        inputsAmount: 2,
        inputTypes: [
          'chain',
          'filter'
        ],
        options:{
            chain: {
              x: [],
              dimension: []
            },                      
            protocol: ['Aave', 'Compound', 'Convex-Finance', 'Curve', 'JustLend', 'Lido', 'MakerDAO', 'PancakeSwap', 'Uniswap'],
            what: ['Volume', 'Unique users'] //'Volume', 'Transaction amount', 'Unique users', 'Average Transaction Volume'
        },        
        inputValues: [
          ['', ''],
          ['Date', '>', '2022-01-01']
        ],       
        revenue_series: [
            {   
                name: 'Aave', 
                data: [],
                logarithmic: true,
                color: 'green',
            },
        ],
        revenue_options: {
          chart: {
                    fontFamily: 'Nunito, sans-serif',
                    zoom: { enabled: false },
                    toolbar: { show: false },
          },
          dataLabels: { enabled: false },
          stroke: { show: true, curve: 'smooth', width: 2, lineCap: 'square' },
          dropShadow: { enabled: true, opacity: 0.2, blur: 10, left: -7, top: 22 },
          colors: ['#2196f3', '#e7515a'],
          labels: [],
          xaxis: {
              axisBorder: { show: false },
              axisTicks: { show: false },
              crosshairs: { show: true },
              labels: { 
                offsetX: 0, 
                offsetY: 5, 
                style: { fontSize: '12px', fontFamily: 'Poppins', cssClass: 'apexcharts-xaxis-title' }
              },
          },
          yaxis: {              
              tickAmount: 7,
              labels: {
                  formatter: function (value) {
                    if(value > 100000000){
                      return Math.floor((value / 1000000000) * 100) / 100 + 'B';
                    }
                    if(value > 1000000){
                      return Math.floor((value / 1000000) * 100) / 100 + 'M';
                    } 
                    if(value < 1000000){
                      return Math.round((value / 1000) * 100) / 100 + 'K';
                    }                     
                  },
                  offsetX: -10,
                  offsetY: 0,
                  style: { fontSize: '12px', fontFamily: 'Poppins', cssClass: 'apexcharts-yaxis-title' },
              },
          },
          grid: {
              borderColor: '#191e3a',
              strokeDashArray: 5,
              xaxis: { lines: { show: true } },
              yaxis: { lines: { show: false } },
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          legend: {
              position: 'top',
              horizontalAlign: 'right',
              offsetY: 0,
              fontSize: '16px',
              fontFamily: 'Poppins',
              markers: { width: 10, height: 10, strokeWidth: 0, strokeColor: '#fff', fillColors: undefined, radius: 12, onClick: undefined, offsetX: 0, offsetY: 0 },
              itemMargin: { horizontal: 20, vertical: 5 },
          },
          tooltip: { theme: 'dark', marker: { show: true }, x: { show: false } },
          fill: {
              type: 'gradient',
              gradient: {
                  type: 'vertical',
                  shadeIntensity: 1,
                  inverseColors: !1,
                  opacityFrom: 0.19,
                  opacityTo: 0.05,
                  stops: [100, 100],
              },
          },
        }
      }
  },  
  methods: {
    addInput: function(what){
      this.inputsAmount += 1;
      if(what == 'filter'){
        this.inputTypes.push(what)
        this.inputValues.push(['', '', ''])
      } else {
        if(this.inputTypes[this.inputTypes.length - 1] == 'filter'){
          this.inputTypes.splice(this.inputTypes.length - 2, 0, what)
          this.inputValues.splice(this.inputTypes.length - 2, 0, ['', ''])
        } else {
          this.inputTypes.push(what)
          this.inputValues.push(['', ''])
        }        
      }      
    },
    removeInput: function(index){
      this.inputsAmount -= 1;
      this.inputTypes.splice(index, 1)
      this.inputValues.splice(index, 1)
    },
    toggleTable: function(){
      this.table = !this.table;
    },
    fetchQuery: async function(){
      let from;
      let to = parseInt((new Date().getTime() / 1000).toFixed(0)); 

      // to do
      // check if all values contain valid entry      
      
      // if inputTypes contains a filter
      if(this.inputTypes.indexOf('filter') !== -1){
        this.inputValues[this.inputTypes.indexOf('filter')].forEach((el, index) => {
            if(index == 2){
              from = parseInt(new Date(el).getTime() / 1000);
            }            
          });
      } else {
        // set default date to 2022-01-01
        from = 1640995200
      }

      let dataArray = []

      for (let index = 0; index < this.inputTypes.length; index++) {
        const element = this.inputTypes[index];           
        if(element == 'protocol'){
          let array = this.inputValues[index];
          // if type == revenue do bar chart         

          let url = 'http://localhost:3000/api/' + array[0] + '/' + array[1] + '/' + from + '/' + to ;      

          await axios
          .get(url)
          .then((res) => {
            dataArray.push({                 
                name: array[0], 
                data: res.data[0].data                         
            })
            this.revenue_options.labels = res.data[0].labels
          })   
        } 
        
        if(element == 'chain'){
          let array = this.inputValues[index];
          // if type == revenue do bar chart         

          let url = 'http://localhost:3000/api/chains/' + array[0] + '/' + array[1].replace(/\s+/, "")  + '/' + from + '/' + to ;      
          
          await axios
          .get(url)
          .then((res) => {
            // fill table data
            this.tableData.push(res.data);
            // 
            let item = {                 
                name: array[0], 
                data: []                         
            };
            let labels = []
            for (let z = 0; z < res.data.rows.length; z++) {
              let el = res.data.rows[z];
              
              labels.push(el[1])
              item.data.push(el[2])
            }
            dataArray.push(item)
            this.revenue_options.labels = labels
          })   
        }       
      }      
      console.log(this.revenue_options.labels);      
      this.revenue_series = dataArray;
    },
  },  
  async beforeMount(){
    // get chains
    let url = 'http://localhost:3000/getChains'; 
    let nameArray = [];
    let dimensionArray = [];
    await axios
    .get(url)
    .then((res) => {
      let chains = res.data;
      for (let z = 0; z < chains.length; z++) {
        let el = chains[z];
        nameArray.push(el.name)
        dimensionArray[el.name] = el.dimensions;
      }
    })   
    this.options.chain.x = nameArray;
    this.options.chain.dimension = dimensionArray;
    console.log(this.options)
  },
  
}
</script>
