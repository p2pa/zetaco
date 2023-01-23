<template>
  <div class="boxed-layout horizontal">
    <AppHeader></AppHeader>
    <br><br>
    <div class="layout-px-spacing dash_1">
      <div class="row layout-top-spacing">
        <div class="widget-border">
          <div class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                        <div class="widget widget-sales-category">
                            <div class="widget-heading">
                                <h5>Query</h5>
                                <button @click="fetchQuery" type="button" class="btn btn-warning btn-sm mb-4 me-2">Run</button>
                            </div>
                            <div class="widget-content">                           

                                <div class="row mb-12" v-for="index in inputsAmount" :key="index">
                                    <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'protocol'">
                                        <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                        <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                        <div class="form-control" v-for="values, i in inputValues[index - 1]" :key="i">
                                          <multiselect v-if="i == 0" v-model="inputValues[index - 1][i]" :options="options.protocol.x" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                          <multiselect v-if="i == 1" v-model="inputValues[index - 1][i]" :options="inputValues[index - 1][0] == '' ? '' : options.protocol.dimension[inputValues[index - 1][0]]" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>                                    
                                        </div>
                                        <span :style="{ cursor: 'pointer', backgroundColor: this.inputValues[index - 1][2] + ' !important' }" class="input-group-text" id="basic-addon1"></span>
                                        <span style="cursor:pointer;" class="input-group-text" id="basic-addon1" @click="removeInput(index - 1)">X</span>
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
                                        <div class="form-control">
                                          <multiselect v-model="inputValues[index - 1][0]" :options="['Last 30D', 'Last 7D', 'Date']" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                        
                                          <div v-if="inputValues[index - 1][0] == 'Date'">
                                            <span v-for="condition, i in inputValues[index - 1]" class="form-control" :key="i">                                  
                                              <multiselect v-if="i == 1" v-model="inputValues[index - 1][1]" :options="['>', '<']" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                              <flat-pickr style="cursor:pointer;padding-top:10px; padding-bottom:10px; background: #292929;border-color: #555555;" v-if="i == 2" v-model="inputValues[index - 1][2]" class="form-control flatpickr active"></flat-pickr>
                                            </span> 
                                          </div>   
                                        </div>
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
          </div>
          <div class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
            <div class="widget widget-revenue">
                <div class="widget-heading">
                    <h5>Results</h5>
                    
                    <div class="dropdown btn-group">
                        <a v-if="chartType == 'bar' || table" class="btn dropdown-toggle btn-icon-only" style="margin-right:15px;" @click="goTo('area')"> 
                          <i class="fa fa-area-chart" aria-hidden="true"></i>
                        </a>
                        <a v-if="chartType == 'area' || table" class="btn dropdown-toggle btn-icon-only" style="margin-right:15px;" @click="goTo('bar')"> 
                          <i class="fa fa-bar-chart" aria-hidden="true"></i>
                        </a>
                        <a v-if="!table " class="btn dropdown-toggle btn-icon-only" style="margin-right:15px;" @click="goTo('table')"> 
                          <i class="fa fa-table" aria-hidden="true"></i>
                        </a>                      
                        <!-- <a href="javascript:;" id="ddlRevenue" class="btn dropdown-toggle btn-icon-only" data-bs-toggle="dropdown" aria-expanded="false">
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
                        </a> -->
                        <!-- <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="ddlRevenue">
                            <li><a href="javascript:;" class="dropdown-item">Last 30 days</a></li>
                        </ul> -->
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
        inputsAmount: 3,
        inputTypes: [
          'protocol',
          'protocol',
          'filter'
        ],
        options:{
            chain: {
              x: [],
              dimension: []
            },
            protocol: {
              x: [],
              dimension: []
            },
            filter: ['Date', 'Last 30D', 'Last 7D']
        },        
        inputValues: [
          ['x2y2', 'users', '#9657d7'],
          ['looksrare', 'users', '#f3f3f8'],
          ['Last 30D', '', '']
        ],       
        revenue_series: [           
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
          xaxis: {            
              type: 'datetime',
              axisBorder: { show: false },
              axisTicks: { show: false },
              crosshairs: { show: true },
              labels: {            
                // formatter: function (timestamp) {
                //   console.log(this.revenue_options)                  
                //   return timestamp;
                //   //return new Date(value).toLocaleDateString('en-US');
                // },      
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
                    if(value > 1000){
                      return Math.round((value / 1000) * 100) / 100 + 'K';
                    } 
                    if(value < 1000){
                      return Math.round(value);
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
          tooltip: { 
            theme: 'dark', 
            marker: { show: true }, 
            x: { 
              show: false 
            } },
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
        this.inputValues.push(['Date', '>', '2022-01-01'])
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
    goTo: function(x){
      switch (x) {
        case 'table':
          this.table = true;
          break;
        case 'area':
          this.table = false;
          this.chartType = 'area';
          break;
        case 'bar':
          this.table = false;
          this.chartType = 'bar';
          break;
      }
    },
    randomColor: function() {
      return `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`;
    },
    fetchQuery: async function(){
      // set default date to 2022-01-01
      let from = 1640995200;
      let to = parseInt((new Date().getTime() / 1000).toFixed(0)); 

      // to do
      // check if all values contain valid entry      
      
      // if inputTypes contains a filter
      if(this.inputTypes.indexOf('filter') !== -1){
        this.inputValues[this.inputTypes.indexOf('filter')].forEach((el, index, arr) => {
            if(arr[0] == 'Last 30D'){
              from = parseInt((new Date().getTime() / 1000).toFixed(0)) - 2592000;
            } else if(arr[0] == 'Last 7D'){
              from = parseInt((new Date().getTime() / 1000).toFixed(0)) - 604800;
            } else {
              if(index == 2){
                if(arr[1] == '>'){
                  from = parseInt(new Date(el).getTime() / 1000);
                } else {
                  to = parseInt(new Date(el).getTime() / 1000);              
                }              
              }    
            }
                    
          });
      } 

      let dataArray = []

      for (let index = 0; index < this.inputTypes.length; index++) {
        const element = this.inputTypes[index];           
        if(element == 'protocol'){
          let array = this.inputValues[index];
          // if type == revenue do bar chart         

          let url = 'http://localhost:3000/api/protocols/' + array[0] + '/' + array[1].replace(/\s+/, "") + '/' + from + '/' + to ;      

          await axios
          .get(url)
          .then((res) => {
            // fill table data
            this.tableData.push(res.data);
            
            let item = {                 
                name: array[0], 
                data: [],
                color: this.randomColor()                     
            };
                        
            //let labels = []

            for (let z = 0; z < res.data.rows.length; z++) {
              let el = res.data.rows[z];

              //labels.push(el[1])
              item.data.push({
                x: new Date(el[1]).getTime(),
                y: el[2]
              })
            }

            dataArray.push(item)
            //this.revenue_options.xaxis.categories = labels;
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
                data: [],
                color: this.randomColor()                      
            };
            //let labels = []
            for (let z = 0; z < res.data.rows.length; z++) {
              let el = res.data.rows[z];
              
              //labels.push(new Date(el[1]))
              item.data.push({
                x: new Date(el[1]).getTime(),
                y: el[2]                
              })
            }
            dataArray.push(item)
            //this.revenue_options.labels = labels
          })   
        }       
      }               
      this.revenue_series = dataArray;
    },
  },  
  async beforeMount(){
    // get chains
    var url = 'http://localhost:3000/api/getChains'; 
    var nameArray = [];
    var dimensionArray = [];
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

    // get protocols
    url = 'http://localhost:3000/api/getProtocols'; 
    nameArray = [];
    dimensionArray = [];
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
    this.options.protocol.x = nameArray;
    this.options.protocol.dimension = dimensionArray;
  },
  
}
</script>

<style>
  html, body.dark, .dark .navbar, .dark .widget, .dark .widget-content {
    background-color: #292929 !important;
    border:none;
  }

  #basic-addon1, .nav-link {
    color:#dcdcdc;
  }

  .dark .input-group-text, .dark .form-control  {
    background-color: #292929 !important;
    border: 1px solid #555555;
    color:#dcdcdc;
  }

  .dark .multiselect__input {
    background-color: #292929 !important;
  }

  .dark .multiselect__tags, .dark .multiselect__single, .dark .form-control[readonly], .dark .multiselect__content-wrapper {
    background-color: #292929 !important;    
    color:#dcdcdc !important;
  }

  .dark .multiselect__tags {
    border-radius:5px;
    border: 1px solid #555555;
    color:#dcdcdc;
  }

  .dark .header-container {
    border-bottom:none;
  }

  .dark .multiselect__placeholder  {
    color:#dcdcdc;
  }
  
  .vue-apexcharts text, .vue-apexcharts span {
    font-family: 'Rubik' !important;
  }

  .widget-border {
    border: 1px solid #555555;
  }
</style>
