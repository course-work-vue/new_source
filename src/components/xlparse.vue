<template>
  <div class="container">
    <p>
      <input type="file" @change="onFileChange" style="margin-left: 15vh;margin-top: 10vh;">
    </p>
    <p>
      <button @click="navExcManage" style="margin-left: 15vh;margin-top: 10vh; width:200px; height:60px;" :style="buttonStyle1" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Нагрузка по преподавателям</button>
    </p>
    <p>
      <button @click="navExcManage2" style="margin-left: 5vh;margin-top: 10vh; width:200px; height:60px;" :style="buttonStyle2" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Состав</button>
    </p>
    <p>
      <button @click="navExcManage3" style="margin-left: 5vh;margin-top: 10vh; width:200px; height:60px;" :style="buttonStyle3" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Факультеты</button>
    </p>
    <p>
      <button @click="navExcManage4" style="margin-left: 5vh;margin-top: 10vh; width:200px; height:60px;" :style="buttonStyle4" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Кафедры</button>
    </p>
    <p>
      <button @click="navExcManage5" style="margin-left: 15vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle5" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Итог ВО</button>
    </p>
    <p>
      <button @click="navExcManage6" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle6" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Распределение</button>
    </p>
    <p>
      <button @click="navExcManage7" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle7" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>ОФО ВО</button>
    </p>
    <p>
      <button @click="navExcManage8" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle81" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Для расписания (лекции)</button>
    </p>
    <p>
      <button @click="navExcManage8" style="margin-left: 15vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle82" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Для расписания (практики)</button>
    </p>
    <p>
      <button @click="navExcManage9" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle9" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Курсовые</button>
    </p>
    <p>
      <button @click="navExcManage10" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle10" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>ПланСвод</button>
    </p>
    <p>
      <button @click="navExcManage11" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle11" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Компетенции</button>
    </p>
    <p>
      <button @click="navExcManage12" style="margin-left: 15vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle12" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Нагрузка по курсам</button>
    </p>
    <p>
      <button @click="navExcManage13" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle13" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Диаграмма курсов</button>
    </p>
    <p>
      <button @click="navExcManage13" style="margin-left: 5vh;margin-top: 5vh; width:200px; height:60px;" :style="buttonStyle14" class="btn btn-primary float-start" type="button"><i class="material-icons-outlined"></i>Практики</button>
    </p>
  </div>
</template>

<script>

import readXlsxFile from 'read-excel-file'
import { readSheetNames } from 'read-excel-file';

import UserService from "../services/user.service";

let kaf_global = ""
let fac_global = ""

export default {
  name: 'Profile',
  data() {
    return {
      buttonStyle1: {
        backgroundColor: 'blue',
      },
      buttonStyle2: {
        backgroundColor: 'blue',
      },
      buttonStyle3: {
        backgroundColor: 'blue',
      },
      buttonStyle4: {
        backgroundColor: 'blue',
      },
      buttonStyle5: {
        backgroundColor: 'blue',
      },
      buttonStyle6: {
        backgroundColor: 'blue',
      },
      buttonStyle7: {
        backgroundColor: 'blue',
      },
      buttonStyle81: {
        backgroundColor: 'blue',
      },
      buttonStyle82: {
        backgroundColor: 'blue',
      },
      buttonStyle9: {
        backgroundColor: 'blue',
      },
      buttonStyle10: {
        backgroundColor: 'blue',
      },
      buttonStyle11: {
        backgroundColor: 'blue',
      },
      buttonStyle12: {
        backgroundColor: 'blue',
      },
      buttonStyle13: {
        backgroundColor: 'blue',
      },
      buttonStyle14: {
        backgroundColor: 'blue',
      }
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {

    this.updateButtonColor1();
    this.updateButtonColor2();
    this.updateButtonColor3();
    this.updateButtonColor4();
    this.updateButtonColor5();
    this.updateButtonColor6();
    this.updateButtonColor7();
    this.updateButtonColor81();
    this.updateButtonColor82();
    this.updateButtonColor9();
    this.updateButtonColor10();
    this.updateButtonColor11();
    this.updateButtonColor12();
    this.updateButtonColor13();
    this.updateButtonColor14();

    if (!this.currentUser) {
      this.$router.push('/login');
    }
  },
  methods: {

    onFileChange(event) {


      var last_hope = ""

      async function fd(rows,name) {
        let a = []
        
        for (var i = 10; i< 230;i++) {
          let str_gruz = "('" + name + "','" + fac_global + "','" + kaf_global +"'," 
          str_gruz = str_gruz + "'" + rows[i][1] + "',"

          str_gruz = str_gruz + "'" + rows[i][2] + "',"
          str_gruz = str_gruz + "'" + rows[i][4] + "',"

          if (i<=130) {
            str_gruz = str_gruz + "'1" + "'," // семестр
          }
          else {
            str_gruz = str_gruz + "'2" + "'," // семестр
          }

          str_gruz = str_gruz + "'" + rows[i][5] + "',"
          str_gruz = str_gruz + "'" + rows[i][6] + "',"

          if (rows[i][8]!="-") {
              str_gruz = str_gruz + "'" + rows[i][8] + "',"
            }
            else {
              str_gruz = str_gruz + "" + rows[i][8] + ","
            }
            if (rows[i][9]!="-") {
              str_gruz = str_gruz + "'" + rows[i][9] + "',"
            }
            else {
              str_gruz = str_gruz + "" + rows[i][9] + ""
            }
            if (rows[i][10]!="-") {
              str_gruz = str_gruz + "'" + rows[i][10] + "',"
            }
            else {
              str_gruz = str_gruz + "" + rows[i][j=10] + ","
            }

          for (var j = 50;j<=62;j++)
          {
            if (rows[i][j]!=null) {
              str_gruz = str_gruz + "'" + rows[i][j] + "',"
            }
            else {
              str_gruz = str_gruz + "" + rows[i][j] + ","
            }
          }
          if (rows[i][63]!=null) {
              str_gruz = str_gruz + "'" + rows[i][63] + "')"
            }
            else {
              str_gruz = str_gruz + "" + rows[i][63] + ")"
            }

          let flag2 = false
          let flag21 = false
          if (rows[i][2]!='0.0.0'&&rows[i][2]!=null) {
            if (i>9&&i<25) {
                if (rows[i][58]!="0") {  //ВКР
                  flag2 = true
                }
            }
            else {
              flag2 = true
            }
            if (i>52&&i<64) {
                if (rows[i][58]!=null) {  //ВКР
                  flag21 = true
                }
            }
            else {
              flag21 = true
            }
            if (i>63&&i<69) {
              flag2 = false;
            }
          }
          let flag3 = false
          if (i>24&&i<53) {
            if (rows[i][60]!="0") {   //Работа в ГЭК
              flag3 = true
            }
          }
          else {
            flag3=true
          }
          let flag4 = false;
          if (i>68&&i<111) {
            if (rows[i][50]!="0"||rows[i][51]!="0"||rows[i][52]!="0"||rows[i][53]!="0"||rows[i][54]!="0"||rows[i][55]!="0"){   //семестры
              flag4 = true 
            }
          }
          else {
            flag4=true
          }
          let flag5 = false;
          if (i>110&&i<118) {
            if (rows[i][56]!="0"){   //семестры
              flag5 = true 
            }
          }
          else {
            flag5=true
          }
          let flag6 = false;
  
          if (i>117&&i<130) {
            if (rows[i][61]!="0"){   //семестры
              flag6 = true 
            }
          }
          else {
            flag6=true
          }
          let flag4n
          if (i>130) {
            if (rows[i][50]!="0"||rows[i][51]!="0"||rows[i][52]!="0"||rows[i][53]!="0"||rows[i][54]!="0"||rows[i][55]!="0"){   //семестры
              flag4n = true 
            }
          }
          else {
            flag4n=true
          }
          let flag5n = false;
          if (i>162&&i<171) {
            if (rows[i][56]!="0"){   //семестры
              flag5n = true 
            }
          }
          else {
            flag5n=true
          }

          let flag6n = false;
  
          if (i>170&&i<200) {
            if (rows[i][61]!="0"){   //семестры
              flag6n = true 
            }
          }
          else {
            flag6n=true
          }
          
          let flag7 = false;
  
          if (i>199&&i<222) {
            if (rows[i][63]!="0"){   //семестры
              flag7 = true 
            }
          }
          else {
            flag7=true
          }
          
          let flag8 = false
          if (i==222) {
            if (rows[i][63]!="0"){   //семестры
              flag8 = true 
            }
          }
          else {
            flag8=true
          }
          let flag9 = false
          if (i==227) {
            if (rows[i][62]!="0"){   //семестры
              flag9 = true 
            }
          }
          else {
            flag9=true
          }

          if (flag2&&flag21&&flag3&&flag4&&flag5&&flag6&&flag4n&&flag5n&&flag6n&&flag7&&flag8&&flag9) {
            if (last_hope == "")
            {
              last_hope = str_gruz
            }
            else {
              last_hope = last_hope + "," + str_gruz
            }
            UserService.insertTempTeachNagr(str_gruz) 
            console.log(str_gruz)
            a.push(str_gruz)
          }
        }

        return a
      }

      async function for_dis(sheet_names) {
        let result = []
        let i = 0
        for (let sheet_name of sheet_names) {
          readXlsxFile(xlsxfile, {sheet: sheet_name}).then(async(rowsS) => {
            result[i] = await setTimeout(fd, 10000, rowsS, sheet_name); 
            i=i+1
            if (i==sheet_names.length-1){
              alert("Данные успешно загружены!")
            }
          })
        }

        return result
      }


    let xlsxfile = event.target.files ? event.target.files[0] : null;       // самый старт
    
    //console.log(xlsxfile)
    
    let flagSostav = false    //Наличие листов
    let flagRaspr = false
    let flagFac = false
    let flagDep = false
    let flagVO = false
    let flagPractice = false
    let flagShed = false;

    const p = new Promise(function(resolve) {
      readSheetNames(xlsxfile).then((sheetNames) => {
        for(let i = 0;i<sheetNames.length;i++) {
          //fix исправить все false на true
          if (sheetNames[i]=="ИТОГ АСПИРАНТУРА") {
            readXlsxFile(xlsxfile, {sheet: "ИТОГ АСПИРАНТУРА"}).then((rowsG) => {

              let arr_kaf = rowsG[1][0].split(" ")
              let arr_fac = rowsG[2][0].split(" ")

              kaf_global = arr_kaf.join(" ")
              fac_global = arr_fac.join(" ")

            })
          }
          if (sheetNames[i]=="Состав КИТ"){
            flagSostav=false      
         }
         if (sheetNames[i]=="факультет"){
           flagFac=false
         }
         if (sheetNames[i]=="Распределение"){
           flagRaspr=false  // Исправить на true
         }
         if (sheetNames[i]=="ИТОГ ВО"){
            flagVO = false
         }
         if (sheetNames[i]=="Практики"){
            flagPractice=false
         }
         if (sheetNames[i]=="Для расписания"){
            flagShed=false
         }

         // По направлениям
         if (sheetNames[i]=="Кафедры"){
           flagDep=true
         }

         if (i==sheetNames.length-1)
          resolve()
        }
      })
    })

    let name1 = []
    let name2 = []
    let name3 = []
    let dolj = []
    let deg = []
    let status = []
    let dolj_id, deg_id, status_id, insFlag1, insFlag2, insFlag3
    let temp = []
    let k = 0
    let mainStr = ""
    let startStr = 0
    
    let nameR1 = []
    let nameR2 = []
    let nameR3 = []
    let tempR = []


    p.then(() => {


        if (flagSostav==true) {
          UserService.clearTempSostav()
          UserService.clearTempTeachGruz()

          readXlsxFile(xlsxfile, {sheet: "Состав КИТ"}).then((rows1) => {

          const p1 = new Promise(function(resolve1){
            k = 1
            while (rows1[k][9]!=null){
              dolj.push(rows1[k][9])
              k+=1
            }
          if (rows1[k][9]==null) {
            resolve1()
          }
          })
      
          p1.then(() => {
            console.log("p1")
          })

          const p2 = new Promise(function(resolve2){
            k = 1
            while (rows1[k][10]!=null){
              deg.push(rows1[k][10])
              k+=1
            }

            if (rows1[k][10]==null) {
              resolve2()
            }
          })
      
          p2.then(() => {
            console.log("p2")
          })

          const p3 = new Promise(function(resolve3){
            k = 1
            while (rows1[k][11]!=null){
              status.push(rows1[k][11])
              k+=1
            }
            

          if (rows1[k][11]==null) {
            resolve3()
          }
          })
      
          p3.then(() => {
            console.log("p3")
          })

          const pf = new Promise(function(resolveF){
            for (let i = 1;i<rows1.length; i++) {
            if (rows1[i][0]!=null){
              temp = rows1[i][0].split(' ')
              name1.push(temp[0])
              name2.push(temp[1])
              name3.push(temp[2])        
            }
            else 
              i = rows1.length

          }

            for (let i = 0;i<name1.length; i++) {
              
              insFlag1 = false
              insFlag2 = false
              insFlag3 = false
              for (let j = 0;j<dolj.length;j++){
                if (rows1[i+1][1]==dolj[j]){
                  dolj_id = j
                  insFlag1 = true
                }
              }
              for (let j = 0;j<deg.length;j++){
                if (rows1[i+1][2]==deg[j]){
                  deg_id = j
                  insFlag2 = true
                }
              }
              for (let j = 0;j<status.length;j++){
                if (rows1[i+1][3]==status[j]){
                  status_id = j
                  insFlag3 = true
                }
              }

              if (insFlag1&&insFlag2&&insFlag3){
                if (startStr == 0) {
                  mainStr = mainStr + "('" + name1[i] +"','" + name2[i] +"','" + name3[i] + "','" + fac_global + "','" + kaf_global +"','" + dolj[dolj_id] +"','" + deg[deg_id] +"','" + status[status_id] + "')"
                  startStr = 1
                }
                else {
                  mainStr = mainStr + ",('" + name1[i] +"','" + name2[i] +"','" + name3[i] + "','" + fac_global + "','" + kaf_global +"','" + dolj[dolj_id] +"','" + deg[deg_id] +"','" + status[status_id] + "')"
                }
              }

              
            if (i==name1.length-1){
              setTimeout(resolveF, 1000);
            }
            }   
          })
          pf.then(() => {
            UserService.insertTempSostav(mainStr)
            for_dis(name1).then(result => {
            console.log(result)
            })

          })

          })

        }

        if (flagFac==true) {

          readXlsxFile(xlsxfile, {sheet: "факультет"}).then((rows3) => {

            UserService.clearTempFac()

            let facStr = ""

          const pfl1 = new Promise(function(resolvefl1){
            k = 0
            while (k<rows3.length){

              if (k==rows3.length-1) {
                facStr = facStr + "('" + rows3[k][0] + "'," + "'" + rows3[k][1] + "')"
                resolvefl1()
              }
              else{
                facStr = facStr + "('" + rows3[k][0] + "'," + "'" + rows3[k][1] + "'),"
              }

              k+=1
            }
          })
      
          pfl1.then(() => {
            UserService.insertTempFac(facStr)
          })


      })
      }


        if (flagRaspr==true) {
          readXlsxFile(xlsxfile, {sheet: "Распределение"}).then((rows2) => {
          for (let i = 9;i<rows2.length; i++) {
            if (rows2[i][0]!=null)
            tempR = rows2[i][0].split(' ', 3)
            if (tempR.length >= 3) {
              nameR1.push(temp[0])
              nameR2.push(temp[1])
              nameR3.push(temp[2])
            }
        }
      })
      }

      if (flagVO==true) {
          UserService.clearTempItogVO()
          readXlsxFile(xlsxfile, {sheet: "ИТОГ ВО"}).then((rowsVO) => {
            let itogVO_str = "('" + fac_global + "','" + kaf_global + "',"
            let VOyears = rowsVO[2][0].split(" ")
            itogVO_str = itogVO_str + "'" + VOyears[3] + "','" 
            + rowsVO[10][11].toFixed(2) + "','" + rowsVO[10][12].toFixed(2) + "','" + rowsVO[10][14] + "','" + rowsVO[10][15].toFixed(2) + "','" + rowsVO[10][17].toFixed(2) + "','"
            + rowsVO[10][18].toFixed(2) + "','" + rowsVO[10][19] + "','" + rowsVO[10][20] + "','" + rowsVO[10][21] + "','" + rowsVO[10][22] + "','"
            + rowsVO[10][23] + "','" + rowsVO[10][24] + "','" + rowsVO[10][26] + "','" + rowsVO[10][27] + "','" + rowsVO[10][28] + "','"
            + rowsVO[10][29] + "','" + rowsVO[10][30] + "','" + rowsVO[10][31] + "','" + rowsVO[10][32] + "','" + rowsVO[10][33] + "')"
            UserService.insertTempItogVO(itogVO_str)
      })
      }


      if (flagPractice==true) {
          readXlsxFile(xlsxfile, {sheet: "Практики"}).then((rowsP) => {
            this.ParsePractice(rowsP)
      })
      }

      if (flagShed==true) {
          readXlsxFile(xlsxfile, {sheet: "Для расписания"}).then((rowsShed) => {
            UserService.clearForShedLec()
            UserService.clearForShedPrac()
            this.ParseShedLec(rowsShed)
            this.ParseShedPrac(rowsShed)
      })
      }


      if (flagDep==true) {
          readXlsxFile(xlsxfile, {sheet: "Кафедры"}).then((rowsl1) => {

            UserService.clearTempDep()

            let depStr = ""

            const pd = new Promise(function(resolveD){
            k = 0
            while (k<rowsl1.length){

              if (k==rowsl1.length-1) {
                depStr = depStr + "('Кафедра " + rowsl1[k][2] + "'," + "null)"
                resolveD()
              }
              else{
                depStr = depStr + "('Кафедра " + rowsl1[k][2] + "',null),"
              }

              k+=1
            }
            })

            pd.then(() => {
              UserService.insertTempDep(depStr)
            })
      })
      }
    })

    setTimeout(this.updateButtonColor4, 2000);
  },
  navExcManage() {
    this.$router.push(`/ManageExcel`); // Navigate to the AddStudent route
},
  navExcManage2() {
    this.$router.push(`/ManageExcel2`); // Navigate to the AddStudent route
},
  navExcManage3() {
    this.$router.push(`/ManageExcel3`); // Navigate to the AddStudent route
},
  navExcManage4() {
    this.$router.push(`/ManageExcel4`); // Navigate to the AddStudent route
},
  navExcManage5() {
    this.$router.push(`/ManageExcel5`); // Navigate to the AddStudent route
},
  navExcManage6() {
    this.$router.push(`/ManageExcel6`); // Navigate to the AddStudent route
},
  navExcManage7() {
    this.$router.push(`/ManageExcel7`); // Navigate to the AddStudent route
},
  navExcManage8() {
    this.$router.push(`/ManageExcel8`); // Navigate to the AddStudent route
},
  navExcManage9() {
    this.$router.push(`/ManageExcel9`); // Navigate to the AddStudent route
},
  navExcManage10() {
    this.$router.push(`/ManageExcel10`); // Navigate to the AddStudent route
},
  navExcManage11() {
    this.$router.push(`/ManageExcel11`); // Navigate to the AddStudent route
},
  navExcManage12() {
    this.$router.push(`/ManageExcel12`); // Navigate to the AddStudent route
},
  navExcManage13() {
    this.$router.push(`/ManageExcel13`); // Navigate to the AddStudent route
},


async updateButtonColor1() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle1.backgroundColor = 'red';
      }
      else {
        this.buttonStyle1.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor2() {
  let response;
  try{
    response = await UserService.getTempSostavCount()
      if (response.data.count==0) {
        this.buttonStyle2.backgroundColor = 'red';
      }
      else {
        this.buttonStyle2.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor3() {
  let response;
  try{
    response = await UserService.getTempFacCount()
      if (response.data.count==0) {
        this.buttonStyle3.backgroundColor = 'red';
      }
      else {
        this.buttonStyle3.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor4() {
  let response;
  try{
    response = await UserService.getTempDepCount()
      if (response.data.count==0) {
        console.log("AAAA")
        this.buttonStyle4.backgroundColor = 'red';
      }
      else {
        this.buttonStyle4.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor5() {
  let response;
  try{
    response = await UserService.getTempItogVOcount()
      if (response.data.count==0) {
        this.buttonStyle5.backgroundColor = 'red';
      }
      else {
        this.buttonStyle5.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor6() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle6.backgroundColor = 'red';
      }
      else {
        this.buttonStyle6.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor7() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle7.backgroundColor = 'red';
      }
      else {
        this.buttonStyle7.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor82() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle81.backgroundColor = 'red';
      }
      else {
        this.buttonStyle81.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor81() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle82.backgroundColor = 'red';
      }
      else {
        this.buttonStyle82.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor9() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle9.backgroundColor = 'red';
      }
      else {
        this.buttonStyle9.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor10() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle10.backgroundColor = 'red';
      }
      else {
        this.buttonStyle10.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor11() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle11.backgroundColor = 'red';
      }
      else {
        this.buttonStyle11.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor12() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle12.backgroundColor = 'red';
      }
      else {
        this.buttonStyle12.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor13() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle13.backgroundColor = 'red';
      }
      else {
        this.buttonStyle13.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async updateButtonColor14() {
  let response;
  try{
    response = await UserService.getTempTeachGruzCount()
      if (response.data.count==0) {
        this.buttonStyle14.backgroundColor = 'red';
      }
      else {
        this.buttonStyle14.backgroundColor = 'blue';
      }
  } 
  catch (error) {
    console.error('Error loading data:', error);
  }
  finally {
    response = null;
  }
},

async ParsePractice(rowsP) {
  let Pyears = rowsP[2][0].split(" ")
  let detRowP, napr

  let pstr = ""
  let falgParseP = false
  let k = 5
  let prof
  while (k<rowsP.length){

    if (rowsP[k][0] != null) {

      detRowP =  rowsP[k][0].split(" ")

      await new Promise(resolve => {

        if (detRowP[0].includes("Направление")) {
          falgParseP = true

          if (detRowP[3].includes(".")) {
            napr = detRowP[3]
          }
          else {
            napr = detRowP[1]
          }

          let parts = rowsP[k+1][0].split(':')
          prof = parts[1].replace(/"/g, '').trim()

          k = k+4
        }
        if (detRowP[0].includes("ИТОГО")) {
          falgParseP = false
        }

        if (falgParseP==true) {
          let parsePDog = (rowsP[k][7] !== null) ? rowsP[k][7] : 0;
          pstr = pstr + "('" + fac_global + "'," + "'" + kaf_global + "'," + "'" + Pyears[0] + "'," + "'" + napr + "'," + "'" + prof + "',"
                      + "'" + rowsP[k][0] + "'," + "'" + rowsP[k][1] + "'," + "'" + rowsP[k][2] + "'," + "'" + rowsP[k][3] + "'," + "'" + rowsP[k][4] + "',"
                      + "'" + rowsP[k][5] + "'," + "'" + rowsP[k][6] + "'," + "'" + parsePDog + "'," + "'" + rowsP[k][8] + "'," + "'" + rowsP[k][9] + "',"
                      + "'" + rowsP[k][10] + "'," + "'" + rowsP[k][11] + "')," 
        }

        resolve()
      })
               
    }

    k++ 

  }

  console.log(pstr.slice(0, -1))
  UserService.insertTempPractice(pstr.slice(0, -1))
},

async ParseShedLec(rowsShed) {

  let shedLecStr = ""

  let k = 2
  while (k<rowsShed.length-1){

    if (rowsShed[k][0] != null) {

      await new Promise(resolveShed => {
        if (rowsShed[k][0]==rowsShed[k+1][0]) {
          k++
        }
        else{
          if(rowsShed[k][7]!=null) {
            shedLecStr = shedLecStr + "('" + fac_global + "'," + "'" + kaf_global + "'," + "'" + rowsShed[k][0] + "'," + "'" + rowsShed[k][1] + "'," + "'" + rowsShed[k][2] + "',"
                                   + "'" + rowsShed[k][3] + "'," + "'" + rowsShed[k][4] + "'," + "'" + rowsShed[k][5] + "'," + "'" + rowsShed[k][6] + "'," + "'" + rowsShed[k][7] + "'),"
          }
        }
          resolveShed()
      })
               
    }

    k++ 

  }
  UserService.insertForShedLec(shedLecStr.slice(0, -1))
},

async ParseShedPrac(rowsShed) {

let shedPracStr = ""

let k = 2
while (k<rowsShed.length-1){

  if (rowsShed[k][0] != null) {

    await new Promise(resolveShed => {
      if (rowsShed[k][13]==rowsShed[k+1][13]) {
        k++
      }
      else{
        if(rowsShed[k][12]!=null) {
          shedPracStr = shedPracStr + "('" + fac_global + "'," + "'" + kaf_global + "'," + "'" + rowsShed[k][0] + "'," + "'" + rowsShed[k][1] + "'," + "'" + rowsShed[k][2] + "',"
                                 + "'" + rowsShed[k][8] + "'," + "'" + rowsShed[k][12] + "'," + "'" + rowsShed[k][13] + "'),"
        }
      }
        resolveShed()
    })
             
  }

  k++ 

}
  UserService.insertForShedPrac(shedPracStr.slice(0, -1))
},



}
}
</script>